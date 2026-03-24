{ fetchurl, pkgs }:
let
	pname = "excalidraw";
	version = "0.1.0";
	binname = "excalidraw-desktop.AppImage";

	src = fetchurl {
		url = "https://github.com/45Hnri/excalidraw-desktop/releases/download/v${version}/${binname}";
		hash = "sha256-UaTw1VHx9xRuz2HoYGd30i7IYxSSiI7wQpJg+nj4BAM=";
	};

	appimageContents = pkgs.appimageTools.extract {inherit pname version src;};
in
	pkgs.appimageTools.wrapType2 {
		inherit pname version src;
		pkgs = pkgs;
		extraInstallCommands = ''
				install -m 444 -D ${appimageContents}/${binname}.desktop -t $out/share/applications
				mv $out/share/applications/${binname}.desktop $out/share/applications/${pname}.desktop
				substituteInPlace $out/share/applications/${pname}.desktop \
					--replace 'Exec=AppRun' 'Exec=${pname}'

				# put the icon in 0x0 for some reason, which does not display correctly
				mkdir -p $out/share/icons/hicolor/512x512
				cp -r ${appimageContents}/usr/share/icons/hicolor/0x0/* \
					$out/share/icons/hicolor/512x512

				# normal procedure
				cp -r ${appimageContents}/usr/share/icons $out/share
		'';
	}
