# coc-omnisharp

A vim plugin powered by
[OmniSharp](https://github.com/omnisharp/omnisharp-roslyn) and
[coc.nvim](https://github.com/neoclide/coc.nvim).

## Prerequisites

1. Vim 8.0+ or NeoVim
2. [dotnet](http://dot.net)
3. [coc.nvim](https://github.com/neoclide/coc.nvim)

## Installation

`coc-omnisharp` is an extension for `coc.nvim`.
You can install `coc.nvim` with a plugin manager like [vim-plug](https://github.com/junegunn/vim-plug):
```vimL
Plug 'neoclide/coc.nvim', {'branch': 'release'}
```

Then, use `:CocInstall coc-omnisharp` to install.

Alternatively, you can have `coc.nvim` automatically install the extension if it's missing:
```vimL
let g:coc_global_extensions=[ 'coc-omnisharp', ... ]
```

## Recommended plugins

[vim-polyglot](https://github.com/sheerun/vim-polyglot) for syntax highlighting 🎨
