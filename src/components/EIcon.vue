<template>
    <span :class="prepended ? 'pr-2' : ''">
        <svg-icon v-if="path" :path="path" :size="sizePx" :viewbox="viewbox"></svg-icon>
    </span>
</template>

<script>
import SvgIcon from '@jamescoyle/vue-icon';
import {IconFlipperZero} from "@/lib/icons";
import {
  mdiHome,
  mdiEarHearing,
  mdiRadar,
  mdiPower,
  mdiSignalCellularOutline,
  mdiSignalCellular1,
  mdiSignalCellular2,
  mdiSignalCellular3,
  mdiAccessPoint,
  mdiRefresh,
  mdiRecordCircleOutline,
  mdiRecord,
  mdiContentSaveOutline,
  mdiTuneVariant,
  mdiSineWave,
  mdiDotsVertical,
  mdiAntenna,
  mdiRenameOutline,
  mdiTrashCanOutline,
  mdiContentCopy,
  mdiArrowLeft,
  mdiClose,
  mdiFolderPlusOutline,
  mdiFolderOutline,
  mdiArrowUpLeft,
  mdiFileMoveOutline,
  mdiFolderMultipleOutline,
  mdiFolderOpenOutline,
  mdiCodeJson,
  mdiMenuDown,
  mdiMenuRight,
  mdiFileOutline,
  mdiInformationBoxOutline,
  mdiImageOutline,
  mdiUploadOutline,
  mdiFilePlusOutline,
  mdiStopCircleOutline,
  mdiCogPlayOutline,
  mdiClockOutline,
  mdiStop,
  mdiRadioTower,
  mdiPowerSleep,
  mdiCog,
  mdiTextBoxMinusOutline,
  mdiTextBoxPlusOutline,
  mdiDownload,
  mdiApplicationEditOutline,
} from '@mdi/js';


export default {
    props: {
        icon: {
            type: String,
            required: true
        },
        size: {
            type: String,
            default: 'normal'
        },
        prepended: {
            type: Boolean,
            default: false
        }
    },
    components: {
        SvgIcon
    },
    setup(props) {
        const iconsMapping = {
            'home': mdiHome,
            'ear-hearing': mdiEarHearing,
            'radar': mdiRadar,
            'power': mdiPower,
            'signal-cellular-outline': mdiSignalCellularOutline,
            'signal-cellular-1': mdiSignalCellular1,
            'signal-cellular-2': mdiSignalCellular2,
            'signal-cellular-3': mdiSignalCellular3,
            'access-point': mdiAccessPoint,
            'refresh': mdiRefresh,
            'record-circle-outline': mdiRecordCircleOutline,
            'record': mdiRecord,
            'content-save-outline': mdiContentSaveOutline,
            'tune-variant': mdiTuneVariant,
            'sine-wave': mdiSineWave,
            'dots-vertical': mdiDotsVertical,
            'antenna': mdiAntenna,
            'rename-outline': mdiRenameOutline,
            'trash-can-outline': mdiTrashCanOutline,
            'content-copy': mdiContentCopy,
            'arrow-left': mdiArrowLeft,
            'close': mdiClose,
            'folder-plus-outline': mdiFolderPlusOutline,
            'folder-outline': mdiFolderOutline,
            'arrow-up-left': mdiArrowUpLeft,
            'file-move-outline': mdiFileMoveOutline,
            'folder-multiple-outline': mdiFolderMultipleOutline,
            'folder-open-outline': mdiFolderOpenOutline,
            'code-json': mdiCodeJson,
            'menu-down': mdiMenuDown,
            'menu-right': mdiMenuRight,
            'file-outline': mdiFileOutline,
            'information-box-outline': mdiInformationBoxOutline,
            'image-outline': mdiImageOutline,
            'upload-outline': mdiUploadOutline,
            'file-plus-outline': mdiFilePlusOutline,
            'stop-circle-outline': mdiStopCircleOutline,
            'cog-play-outline': mdiCogPlayOutline,
            'clock-outline': mdiClockOutline,
            'stop': mdiStop,
            'radio-tower': mdiRadioTower,
            'power-sleep': mdiPowerSleep,
            'cog': mdiCog,
            'text-box-plus': mdiTextBoxPlusOutline,
            'text-box-minus': mdiTextBoxMinusOutline,
            'download': mdiDownload,
            'application-edit-outline': mdiApplicationEditOutline,

            'flipper-zero': IconFlipperZero,
        }
        const sizeMapping = {
            'x-small': 12,
            'small': 16,
            'normal': 24,
            'large': 32
        }

        let icon = props.icon in iconsMapping ? iconsMapping[props.icon] : null;
        if (icon === undefined || icon === null) {
            icon = iconsMapping['image-outline'];
        }

        let path = '';
        let viewbox = '0 0 24 24';
        if (typeof icon === 'object') {
            path = icon.path;
            viewbox = icon.viewbox;
        } else {
            path = icon;
        }

        const sizePx = sizeMapping[props.size] || sizeMapping['normal'];

        return { path, sizePx, viewbox }
    }
}
</script>
