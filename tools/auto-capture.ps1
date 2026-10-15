param([string]$Url, [string]$Out, [int]$WaitSec = 10, [int]$Port = 9500, [switch]$Headed)
# Edge를 화면 없이 띄워 페이지를 열고, 쿠키·팝업 창을 닫은 뒤 첫 화면(1440x900)을 PNG로 저장한다.
# 예) powershell -ExecutionPolicy Bypass -File tools\auto-capture.ps1 -Url https://www.kurly.com -Out captures\auto\kurly.png
# 자동 접속을 막는 사이트(403·빈 화면·점검 안내)는 사용자에게 직접 캡처를 부탁한다. 우회는 시도하지 않는다.
$sp = Split-Path -Parent $MyInvocation.MyCommand.Path
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$prof = Join-Path $env:TEMP "dgs-edge-shot-$Port"
$args = @("--disable-gpu", "--disable-extensions", "--remote-debugging-port=$Port", "--user-data-dir=`"$prof`"", "--window-size=1440,1000", "--lang=ko-KR", "about:blank")
if (-not $Headed) { $args = @("--headless=new") + $args } else { $args = @("--window-position=-2400,0") + $args }
$proc = Start-Process -FilePath $edge -ArgumentList $args -PassThru
try {
  $targets = $null
  for ($i = 0; $i -lt 60 -and -not $targets; $i++) { Start-Sleep -Milliseconds 250; try { $targets = Invoke-RestMethod "http://127.0.0.1:$Port/json" } catch {} }
  $page = $targets | Where-Object type -eq "page" | Select-Object -First 1
  $ws = New-Object System.Net.WebSockets.ClientWebSocket
  $ws.ConnectAsync([Uri]$page.webSocketDebuggerUrl, [Threading.CancellationToken]::None).Wait()
  $script:id = 0
  function Send($method, $params) {
    $script:id++
    $msg = @{ id = $script:id; method = $method; params = $params } | ConvertTo-Json -Depth 10 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($msg)
    $ws.SendAsync((New-Object ArraySegment[byte] (, $bytes)), "Text", $true, [Threading.CancellationToken]::None).Wait()
    $want = $script:id
    while ($true) {
      $buf = New-Object byte[] 4194304; $ms = New-Object IO.MemoryStream
      do { $r = $ws.ReceiveAsync((New-Object ArraySegment[byte] (, $buf)), [Threading.CancellationToken]::None).Result; $ms.Write($buf, 0, $r.Count) } while (-not $r.EndOfMessage)
      $obj = [Text.Encoding]::UTF8.GetString($ms.ToArray()) | ConvertFrom-Json
      if ($obj.id -eq $want) { return $obj }
    }
  }
  Send "Emulation.setDeviceMetricsOverride" @{ width = 1440; height = 900; deviceScaleFactor = 1; mobile = $false } | Out-Null
  Send "Emulation.setEmulatedMedia" @{ features = @(@{ name = "prefers-color-scheme"; value = "light" }) } | Out-Null
  Send "Page.navigate" @{ url = $Url } | Out-Null
  Start-Sleep -Seconds $WaitSec
  # 쿠키·개인정보 동의 창 닫기: "동의/수락/허용/Accept" 버튼을 누르고, 남은 오버레이는 숨긴다
  $dismiss = @'
(() => {
  const words = /^(모두 허용|모두 수락|모두 동의|전체 동의|동의|수락|확인|닫기|계속하기|오늘 하루 보지 않기|Accept All|Accept all|Accept All Cookies|Accept|Allow all|I agree|OK|Agree|Got it|Close)$/i;
  let clicked = 0;
  document.querySelectorAll('button, a, [role=button]').forEach((b) => {
    const t = (b.innerText || '').trim();
    const h = b.tagName === 'A' ? (b.getAttribute('href') || '') : '';
    if (h && !h.startsWith('#') && !h.startsWith('javascript')) return; // 다른 페이지로 가는 링크는 누르지 않는다
    if (t && t.length < 20 && words.test(t)) { b.click(); clicked++; }
  });
  return clicked;
})()
'@
  $c = Send "Runtime.evaluate" @{ expression = $dismiss; returnByValue = $true }; Start-Sleep -Seconds 2; $c2 = Send "Runtime.evaluate" @{ expression = $dismiss; returnByValue = $true }
  Start-Sleep -Seconds 3
  Send "Runtime.evaluate" @{ expression = "window.scrollTo(0,0)"; returnByValue = $true } | Out-Null
  Start-Sleep -Milliseconds 800
  $title = (Send "Runtime.evaluate" @{ expression = "document.title"; returnByValue = $true }).result.result.value
  $shot = Send "Page.captureScreenshot" @{ format = "png"; clip = @{ x = 0; y = 0; width = 1440; height = 900; scale = 1 } }
  [IO.File]::WriteAllBytes($Out, [Convert]::FromBase64String($shot.result.data))
  "clicked=$($c.result.result.value) title=$title"
} finally {
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
}
