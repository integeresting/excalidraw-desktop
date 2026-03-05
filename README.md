<h1 align="center">Excalidraw-Desktop</h1>

https://github.com/user-attachments/assets/f6829c74-c12f-4f78-8208-e0b5b57eb6dc

**[Excalidraw](https://github.com/excalidraw/excalidraw) as a standalone binary:**
- offline
- command-line argument support
- image and file export shortcuts

> [!NOTE] 
> This **prototype** mainly exists because the Excalidraw-PWA does not integrate as well in my neovim workflow.

---

## Usage

```bash
excalidraw <PATH>
```

### Shortcuts

|   key   | action               |
|:-------:|----------------------|
| \<A-w\> | write file to path   |
| \<A-p\> | write image to path  |
| \<A-a\> | write image and file |
| \<A-P\> | switch image type    |
| \<A-m\> | toggle darkmode      |

---

## Installation

- clone this repo to your machine

### Linux

```bash
npm run build
mv release/0.0.0/excalidraw-Linux-0.0.0.AppImage ~/.local/bin/excalidraw
chmod u+x ~/.local/bin/excalidraw
```

> [!important] 
> this requires you to have `~/.local/bin/excalidraw` in your `$PATH`

#### NixOS

AppImage binaries are dynamically linked, so they don't work on Nix OOTB.
Luckily there are these handy options for [registering an interpreter to run them](https://nixos.wiki/wiki/Appimage):

```nix
{
	programs.appimage = {
		enable = true;
		binfmt = true;
	};
}
```


**For better integration you can also use the `excalidraw-desktop.nix` file**

```nix
{ config, lib, pkgs, ... }:
{
    environment.systemPackages = [
        # adjust path as needed
        (pkgs.callPackage ./packages/excalidraw-desktop.nix {})
    ];
}
```

#### .desktop Entries

Example file (`/home/user/.local/share/applications/excalidraw.desktop`):

```
[Desktop Entry]
Name=Excalidraw
Comment=Whiteboarding App
Exec=/home/user/.local/bin/excalidraw
Icon=/home/user/.local/share/icons/excalidraw-icon.png
Terminal=false
Type=Application
MimeType=text/json
Categories=Utility;
```

Setting and updating desktop entries with `desktop-file-utils`

```bash
desktop-file-validate ~/<FILE-LOCATION>/excalidraw.desktop
desktop-file-install --dir=~/.local/share/applications ~/<FILE-LOCATION>/excalidraw.desktop
update-desktop-database ~/.local/share/applications
```

### Windows

Just kidding.

---

## Integration

### Neovim

My current keybinds:

```lua
-- usually [name](path) in markdown
-- open the next content in braces as a path in excalidraw
vim.keymap.set("n", "<leader>xo", function()
    vim.cmd("norm yib")
    local word = vim.fn.getreg('"')
    vim.fn.jobstart({'excalidraw',word})
end, { noremap = true, silent = true })

-- take a markdown link and convert the path to an svg image
vim.keymap.set("n", "<leader>xp", function()
    vim.cmd("norm Vy")
    local filename = string.match(vim.fn.getreg('"'),"^.+%.")
    vim.cmd("norm o!"..filename.."svg)")
end, { noremap = true, silent = true })
```

---

## Development

### Environment Variables

|           Key          | Functionality             |
|:----------------------:|---------------------------|
| VITE_TESTING_FILE_PATH | Argument for path of file |

### PNPM Support

For the time we are stuck with npm.
["Why no pnpm, electron?" JS-dev asked calmly](https://github.com/electron/forge/issues/2633#issuecomment-2642437325)



