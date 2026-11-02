@echo off
title MilanView - Building MilanView.exe
echo ========================================================
echo   MilanView Remote Desktop - Windows EXE Generator
echo ========================================================
echo.
echo Compiling native Windows executable: MilanView.exe ...
echo.

set OUTPUT_EXE=%~dp0MilanView.exe
set APP_URL=https://ais-dev-3kkvmlvkoktimq3tu5rut2-1001368005830.asia-southeast1.run.app

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$code = @'^
using System;^
using System.Diagnostics;^
using System.Drawing;^
using System.Windows.Forms;^
^
namespace MilanView {^
    public class Program {^
        [STAThread]^
        public static void Main() {^
            string url = \"%APP_URL%\";^
            try {^
                ProcessStartInfo psi = new ProcessStartInfo {^
                    FileName = \"msedge.exe\",^
                    Arguments = \"--app=\" + url + \" --window-size=1280,840 --disable-features=TranslateUI\",^
                    UseShellExecute = true^
                };^
                Process.Start(psi);^
            } catch {^
                try {^
                    ProcessStartInfo psiChrome = new ProcessStartInfo {^
                        FileName = \"chrome.exe\",^
                        Arguments = \"--app=\" + url + \" --window-size=1280,840\",^
                        UseShellExecute = true^
                    };^
                    Process.Start(psiChrome);^
                } catch {^
                    Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });^
                }^
            }^
        }^
    }^
}^
'@;^
Add-Type -TypeDefinition $code -Language CSharp -OutputAssembly '%OUTPUT_EXE%' -OutputType WindowsApplication -ReferencedAssemblies 'System.Windows.Forms.dll','System.Drawing.dll','System.dll';^
Write-Host 'SUCCESS: MilanView.exe generated successfully at: %OUTPUT_EXE%' -ForegroundColor Green"

echo.
if exist "%OUTPUT_EXE%" (
    echo ========================================================
    echo   BUILD SUCCESS! 
    echo   File created: %OUTPUT_EXE%
    echo   You can now double-click MilanView.exe to run MilanView!
    echo ========================================================
) else (
    echo [!] Falling back to portable launcher: MilanView.cmd
    (
        echo @echo off
        echo start "" msedge.exe --app=%APP_URL% --window-size=1280,840
    ) > "%~dp0MilanView.cmd"
    echo Created portable launcher: %~dp0MilanView.cmd
)

echo.
pause
