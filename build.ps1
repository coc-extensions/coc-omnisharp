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
    $Watch
)

if (!(Get-Command npm)) {
    throw "You must install Node.js & npm."
}

npm install

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
