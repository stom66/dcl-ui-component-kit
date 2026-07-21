import { MainUI as DebugToggle }      from 'src/scaling-ui/layers/debug.toggles'
// import { MainUI as SafeZonesDesktop } from 'src/scaling-ui/layers/info.safeZone.desktop'
// import { MainUI as SafeZonesMobile }  from 'src/scaling-ui/layers/info.safeZone.mobile'
import { MainUI as InfoUI }           from 'src/scaling-ui/layers/ui.info'
import { MainUI as SimpleUI }         from 'src/scaling-ui/layers/ui.simple'
// import { MainUI as VersionUI }        from 'src/scaling-ui/layers/ui.version'


/** Layers mounted by SetupScalingUI. Comment out entries to hide them. */
export const activeLayers = [
	InfoUI,
	// SafeZonesDesktop,
	// SafeZonesMobile,
	SimpleUI,
	// VersionUI,
	DebugToggle,
]
