{ fetchurl, pkgs }:
let
	pname = "excalidraw-desktop";
	version = "0.0.0";

	src = fetchurl {
		url = "https://github.com/45Hnri/excalidraw-desktop/releases/download/v${version}/excalidraw";
		hash = "sha256:1ce92eefb1a161ced75177d55e32586e590db5107121f885fe304544164816fa";
	};

	appimageContents = pkgs.appimageTools.extract {inherit pname version src;};
in
	pkgs.appimageTools.wrapType2 {
		inherit pname version src;
		pkgs = pkgs;
		extraInstallCommands = ''
				install -m 444 -D ${appimageContents}/${pname}.desktop -t $out/share/applications
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
