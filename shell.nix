{ pkgs ? import <nixpkgs> {} }:

let
	libs = with pkgs; [
		alsa-lib
		cups
		expat
		libdrm
		libgbm
		libxkbcommon
		xorg.libX11
		xorg.libXcomposite
		xorg.libxcb
		atk
		cairo
		dbus
		glib
		gtk3
		nspr
		nss
		pango
		xorg.libXdamage
		xorg.libXext
		xorg.libXfixes
		xorg.libXrandr
		libGL
	];
in
	pkgs.mkShell {
		packages = [ pkgs.appimage-run ];
		buildInputs = [ pkgs.nodejs_20 ] ++ libs;
		shellHook = ''
		export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath libs}:$LD_LIBRARY_PATH
		export LD_LIBRARY_PATH=${pkgs.nss}/lib:$LD_LIBRARY_PATH
		'';
	}
