param(
    # Determines if we run `npm pack`.
    [Parameter()]
    [switch]
    $Pack,

    # Determines if we run the tests.
    [Parameter()]
    [switch]
    $Test,

    # Runs the watch npm command instead.
    [Parameter()]
    [switch]
    $Watch,

    # Determines if we hack the compiled content into the installed plugin
    [Parameter()]
    [switch]
    $Update
)

if (!(Get-Command npm)) {
    throw "You must install Node.js & npm."
}

npm install

if (Test-Path .\out) {
    Remove-Item -Recurse -Force .\out
}

if ($Watch.IsPresent) {
    npm run watch
    return
} else {
    npm run compile
}

if ($Test.IsPresent) {
    # We would run the tests here.
}

if ($Pack.IsPresent) {
    npm pack
}

if ($Update.IsPresent) {
    Write-Host "Updating installed extension..."
    Copy-Item out\client\* $env:LocalAppData\coc\extensions\node_modules\coc-omnisharp\out\client\
    Copy-Item .\package.json $env:LocalAppData\coc\extensions\node_modules\coc-omnisharp\
}
