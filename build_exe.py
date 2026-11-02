import struct
import os

def create_windows_exe(output_path, url):
    """
    Constructs a valid standalone 64-bit Windows PE (Portable Executable) binary.
    When executed on Windows, it calls WinExec with the MilanView webapp URL in app-mode,
    then cleanly terminates via ExitProcess.
    """
    cmd1 = f"msedge.exe --app={url} --window-size=1280,840"
    cmd2 = f"cmd.exe /c start {url}"
    
    # We will build a minimal PE32+ (x64) executable
    # Sections:
    # 1. .text (code)
    # 2. .rdata (imports, strings, constants)
    
    # Section alignments
    FILE_ALIGN = 0x200
    SEC_ALIGN  = 0x1000
    IMAGE_BASE = 0x140000000

    # DOS Header (64 bytes)
    # e_magic: MZ (0x5A4D)
    # e_lfanew at 0x3C points to PE header (say at 0x80)
    dos_header = bytearray(0x80)
    dos_header[0:2] = b'MZ'
    dos_header[0x3C:0x40] = struct.pack('<I', 0x80)

    # PE Signature
    pe_sig = b'PE\0\0'

    # Machine: AMD64 (0x8664)
    # NumberOfSections: 2 (.text, .rdata)
    # TimeDateStamp: 0x66000000
    # PointerToSymbolTable: 0
    # NumberOfSymbols: 0
    # SizeOfOptionalHeader: 0xF0 (standard for PE32+)
    # Characteristics: 0x0022 (EXECUTABLE_IMAGE | LARGE_ADDRESS_AWARE)
    coff_header = struct.pack('<HHIIIHH',
        0x8664, 2, 0x66000000, 0, 0, 0xF0, 0x0022
    )

    # Optional Header (PE32+ / 64-bit)
    # Magic: 0x020B (PE32+)
    # MajorLinkerVersion: 14, MinorLinkerVersion: 0
    # SizeOfCode: 0x1000
    # SizeOfInitializedData: 0x1000
    # SizeOfUninitializedData: 0
    # AddressOfEntryPoint: 0x1000 (start of .text)
    # BaseOfCode: 0x1000
    # ImageBase: 0x140000000
    # SectionAlignment: 0x1000
    # FileAlignment: 0x200
    # MajorOperatingSystemVersion: 6, MinorOperatingSystemVersion: 0
    # MajorImageVersion: 0, MinorImageVersion: 0
    # MajorSubsystemVersion: 6, MinorSubsystemVersion: 0
    # Win32VersionValue: 0
    # SizeOfImage: 0x3000
    # SizeOfHeaders: 0x400
    # CheckSum: 0
    # Subsystem: 2 (IMAGE_SUBSYSTEM_WINDOWS_GUI -> No console popup!)
    # DllCharacteristics: 0x8160 (DYNAMIC_BASE | NX_COMPAT | TERMINAL_SERVER_AWARE)
    # SizeOfStackReserve: 0x100000
    # SizeOfStackCommit: 0x1000
    # SizeOfHeapReserve: 0x100000
    # SizeOfHeapCommit: 0x1000
    # LoaderFlags: 0
    # NumberOfRvaAndSizes: 16
    
    # Data Directories (16 entries * 8 bytes each = 128 bytes = 0x80)
    # Entry 1: Import Table (RVA=0x2000, Size=0x100)
    # Entry 12: IAT (RVA=0x2050, Size=0x20)
    data_dirs = bytearray(16 * 8)
    # Import Table is index 1
    import_rva = 0x2000
    import_size = 0x200
    data_dirs[8:16] = struct.pack('<II', import_rva, import_size)
    # IAT is index 12
    iat_rva = 0x2050
    iat_size = 0x18
    data_dirs[12*8 : 12*8 + 8] = struct.pack('<II', iat_rva, iat_size)

    opt_header = struct.pack('<HBBIIIIIQIIHHHHHHIIIIHHQQQQII',
        0x020B, 14, 0,
        0x1000, 0x1000, 0,
        0x1000, 0x1000,
        IMAGE_BASE,
        SEC_ALIGN, FILE_ALIGN,
        6, 0,
        0, 0,
        6, 0,
        0,
        0x3000, 0x400, 0,
        2, 0x8160,
        0x100000, 0x1000,
        0x100000, 0x1000,
        0, 16
    ) + data_dirs

    # Section Headers (40 bytes each)
    # .text:
    # VirtualSize: 0x1000, VirtualAddress: 0x1000, SizeOfRawData: 0x200, PointerToRawData: 0x400
    # Characteristics: 0x60000020 (CODE | EXECUTE | READ)
    text_sec_header = struct.pack('<8sIIIIIIHHI',
        b'.text\0\0\0',
        0x1000, 0x1000, 0x200, 0x400,
        0, 0, 0, 0,
        0x60000020
    )

    # .rdata:
    # VirtualSize: 0x1000, VirtualAddress: 0x2000, SizeOfRawData: 0x400, PointerToRawData: 0x600
    # Characteristics: 0x40000040 (INITIALIZED_DATA | READ)
    rdata_sec_header = struct.pack('<8sIIIIIIHHI',
        b'.rdata\0\0',
        0x1000, 0x2000, 0x400, 0x600,
        0, 0, 0, 0,
        0x40000040
    )

    # Headers padding up to 0x400
    headers = dos_header + pe_sig + coff_header + opt_header + text_sec_header + rdata_sec_header
    if len(headers) < 0x400:
        headers += b'\0' * (0x400 - len(headers))

    # --- .rdata layout (starts at RVA 0x2000, Raw 0x600) ---
    # 0x2000: IMAGE_IMPORT_DESCRIPTOR (20 bytes for kernel32.dll, 20 bytes null terminator)
    # 0x2030: OriginalFirstThunk (ILT) -> pointers to Hint/Names
    # 0x2050: FirstThunk (IAT) -> pointers to Hint/Names
    # 0x2070: "kernel32.dll\0"
    # 0x2080: Hint/Name for WinExec (Hint: 0, "WinExec\0")
    # 0x2090: Hint/Name for ExitProcess (Hint: 0, "ExitProcess\0")
    # 0x2100: string cmd1
    # 0x2200: string cmd2

    rdata = bytearray(0x400)

    # IMAGE_IMPORT_DESCRIPTOR
    # OriginalFirstThunk RVA: 0x2030
    # TimeDateStamp: 0
    # ForwarderChain: 0
    # Name RVA: 0x2070 ("kernel32.dll")
    # FirstThunk (IAT) RVA: 0x2050
    import_desc = struct.pack('<IIIII', 0x2030, 0, 0, 0x2070, 0x2050)
    null_desc = struct.pack('<IIIII', 0, 0, 0, 0, 0)
    rdata[0:20] = import_desc
    rdata[20:40] = null_desc

    # ILT at 0x2030 (offset 0x30):
    # entry 0 -> 0x2080 (WinExec)
    # entry 1 -> 0x2090 (ExitProcess)
    # entry 2 -> 0 (null)
    rdata[0x30:0x48] = struct.pack('<QQQ', 0x2080, 0x2090, 0)

    # IAT at 0x2050 (offset 0x50):
    # entry 0 -> 0x2080 (WinExec)
    # entry 1 -> 0x2090 (ExitProcess)
    # entry 2 -> 0 (null)
    rdata[0x50:0x68] = struct.pack('<QQQ', 0x2080, 0x2090, 0)

    # Name "kernel32.dll" at 0x2070 (offset 0x70)
    k32_name = b'kernel32.dll\0'
    rdata[0x70 : 0x70 + len(k32_name)] = k32_name

    # Hint/Name for WinExec at 0x2080 (offset 0x80)
    rdata[0x80:0x82] = struct.pack('<H', 0)
    winexec_name = b'WinExec\0'
    rdata[0x82 : 0x82 + len(winexec_name)] = winexec_name

    # Hint/Name for ExitProcess at 0x2090 (offset 0x90)
    rdata[0x90:0x92] = struct.pack('<H', 0)
    exit_name = b'ExitProcess\0'
    rdata[0x92 : 0x92 + len(exit_name)] = exit_name

    # Command strings
    cmd1_bytes = cmd1.encode('utf-8') + b'\0'
    cmd2_bytes = cmd2.encode('utf-8') + b'\0'
    rdata[0x100 : 0x100 + len(cmd1_bytes)] = cmd1_bytes
    rdata[0x200 : 0x200 + len(cmd2_bytes)] = cmd2_bytes

    # --- .text code (RVA 0x1000, Raw 0x400) ---
    # x64 Assembly:
    # sub rsp, 0x28              ; 48 83 EC 28 (shadow stack space)
    # lea rcx, [rip + cmd1_disp] ; 48 8D 0D ... (cmd1 at RVA 0x2100)
    # mov edx, 1                 ; BA 01 00 00 00 (SW_SHOWNORMAL)
    # call qword ptr [rip + winexec_iat] ; FF 15 ... (IAT WinExec at RVA 0x2050)
    # cmp eax, 31                ; 83 F8 1F (check if failed <= 31)
    # ja .exit                   ; 77 11
    # lea rcx, [rip + cmd2_disp] ; fallback to cmd2 (RVA 0x2200)
    # mov edx, 0                 ; BA 00 00 00 00 (SW_HIDE)
    # call qword ptr [rip + winexec_iat]
    # .exit:
    # xor ecx, ecx               ; 31 C9
    # call qword ptr [rip + exit_iat] ; call ExitProcess (IAT ExitProcess at RVA 0x2058)
    # add rsp, 0x28              ; 48 83 C4 28
    # ret                        ; C3

    code = bytearray()
    
    # 0x00: sub rsp, 0x28
    code += b'\x48\x83\xEC\x28'
    
    # 0x04: lea rcx, [rip + disp] -> target is RVA 0x2100
    # current rip will be 0x1004 + 7 = 0x100B
    # disp = 0x2100 - 0x100B = 0x10F5
    code += b'\x48\x8D\x0D' + struct.pack('<i', 0x2100 - 0x100B)
    
    # 0x0B: mov edx, 1
    code += b'\xBA\x01\x00\x00\x00'
    
    # 0x10: call [rip + winexec_iat] -> target RVA 0x2050
    # current rip will be 0x1010 + 6 = 0x1016
    # disp = 0x2050 - 0x1016 = 0x103A
    code += b'\xFF\x15' + struct.pack('<i', 0x2050 - 0x1016)
    
    # 0x16: cmp eax, 31 (if > 31 it succeeded)
    code += b'\x83\xF8\x1F'
    
    # 0x19: ja .done (skip fallback) -> jump to offset 0x36
    # target is 0x36, current rip is 0x19 + 2 = 0x1B, disp = 0x36 - 0x1B = 0x1B
    code += b'\x77\x1B'
    
    # 0x1B: lea rcx, [rip + cmd2] -> target RVA 0x2200
    # current rip is 0x101B + 7 = 0x1022
    # disp = 0x2200 - 0x1022 = 0x11DE
    code += b'\x48\x8D\x0D' + struct.pack('<i', 0x2200 - 0x1022)
    
    # 0x22: mov edx, 0 (SW_HIDE)
    code += b'\xBA\x00\x00\x00\x00'
    
    # 0x27: call [rip + winexec_iat]
    # current rip is 0x1027 + 6 = 0x102D
    # disp = 0x2050 - 0x102D = 0x1023
    code += b'\xFF\x15' + struct.pack('<i', 0x2050 - 0x102D)
    
    # 0x2D: nops to align to 0x36
    while len(code) < 0x36:
        code += b'\x90'
        
    # 0x36: xor ecx, ecx
    code += b'\x31\xC9'
    
    # 0x38: call [rip + exit_iat] -> target RVA 0x2058
    # current rip is 0x1038 + 6 = 0x103E
    # disp = 0x2058 - 0x103E = 0x101A
    code += b'\xFF\x15' + struct.pack('<i', 0x2058 - 0x103E)
    
    # 0x3E: add rsp, 0x28
    code += b'\x48\x83\xC4\x28'
    
    # 0x42: ret
    code += b'\xC3'

    # Pad .text to 0x200 bytes
    text = bytes(code)
    text += b'\xCC' * (0x200 - len(text))

    # Combine file
    full_exe = headers + text + bytes(rdata)
    
    with open(output_path, 'wb') as f:
        f.write(full_exe)
        
    print(f"Successfully generated standalone Windows executable: {output_path} ({len(full_exe)} bytes)")

if __name__ == '__main__':
    url = "https://ais-dev-3kkvmlvkoktimq3tu5rut2-1001368005830.asia-southeast1.run.app"
    create_windows_exe("public/MilanView.exe", url)
