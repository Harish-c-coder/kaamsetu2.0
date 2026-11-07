Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Check if already listening on port 5174
Set oExec = WshShell.Exec("netstat -ano")
sOutput = oExec.StdOut.ReadAll

If InStr(sOutput, ":5174") = 0 Then
    ' Start server silently in background
    WshShell.CurrentDirectory = "C:\Users\banda\OneDrive\Desktop\python learning\hyperlocal-connect"
    WshShell.Run "cmd /c call npm run dev", 0, False
    WScript.Sleep 3500
End If
