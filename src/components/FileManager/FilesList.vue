<template>
    <TreeTable :value="files" class="p-treetable-sm" v-model:expandedKeys="expandedDirectories" row-hover>
        <Column field="name" :expander="true" :class="{ 'text-xs': mobile }"
            class="w-3/5 text-ellipsis overflow-hidden text-nowrap mr-4">
            <template #rowtogglericon="{ expanded }">
                <e-icon v-if="expanded" icon="menu-down" />
                <e-icon v-else icon="menu-right" />
            </template>
            <template #body="{ node }">
                <span @click="openSignalWindow(node.data.fullpath)" v-if="node.type === 'file'">
                    <e-icon :icon="getFileIconByName(node.data.name)" :size="mobile ? 'x-small' : 'small'" prepended
                        class="align-bottom" /> {{ node.data.name }}
                </span>
                <span v-else @click="toggleExpandDirectory(node.key)">
                    <e-icon icon="folder-outline" :size="mobile ? 'x-small' : 'small'" prepended class="align-bottom" /> {{
                        node.data.name !== '' ? node.data.name : 'root' }}
                </span>
            </template>
        </Column>
        <Column class="flex justify-end text-xs">
            <template #body="{ node }">
                <template v-if="node.type === 'directory'">
                    <span>
                        <Button v-if="actionCreateDirectory" text size="small"
                            @click="openCreateDirectoryPopup(node.data.fullpath)">
                            <template #icon>
                                <e-icon icon='folder-plus-outline' :size="mobile ? 'x-small' : 'small'" />
                            </template>
                        </Button>
                    </span>
                </template>
                <template v-else>
                    <span>
                        <Button text size="small" v-if="actionTransmit" @click="transmit(node.data.fullpath)"
                            severity="success">
                            <template #icon>
                                <e-icon icon='radio-tower' :size="mobile ? 'x-small' : 'small'" />
                            </template>
                        </Button>
                    </span>
                    <span>
                        <Button v-if="actionInfo" text size="small" severity="info"
                            @click="openSignalWindow(node.data.fullpath)">
                            <template #icon>
                                <e-icon icon='information-box-outline' :size="mobile ? 'x-small' : 'small'" />
                            </template>
                        </Button>
                    </span>
                </template>


                <template v-if="node.data.fullpath !== ''">
                    <span>
                        <Button text size="small" v-if="actionRename"
                            @click="openRenamePopup(node.data.name, node.data.directory, node.data.fullpath)"
                            severity="info">
                            <template #icon>
                                <e-icon icon='rename-outline' :size="mobile ? 'x-small' : 'small'" />
                            </template>
                        </Button>
                    </span>
                    <span>
                        <Button v-if="actionMove" text size="small"
                            @click="openMovePopup(node.data.name, node.data.fullpath)" severity="info">
                            <template #icon>
                                <e-icon icon='file-move-outline' :size="mobile ? 'x-small' : 'small'" />
                            </template>
                        </Button>
                    </span>
                    <span>
                        <template v-if="actionDelete">
                            <Button v-if="node.children === undefined || node.children.length === 0" text size="small"
                                @click="openDeletePopup(node.data.fullpath)" severity="warning">
                                <template #icon>
                                    <e-icon icon='trash-can-outline' :size="mobile ? 'x-small' : 'small'" />
                                </template>
                            </Button>
                            <Button v-else text size="small" severity="secondary"
                                v-tooltip.left="{ value: 'Can not be removed because have files/directories inside' }">
                                <template #icon>
                                    <e-icon icon='trash-can-outline' :size="mobile ? 'x-small' : 'small'" />
                                </template>
                            </Button>
                        </template>
                    </span>
                </template>
            </template>
        </Column>
    </TreeTable>
    <SignalWindow ref="signalWindow" />
    <CreateDirectoryWidget ref="createDirectoryPopup" @created="onDirectoryCreated" />
    <RenameWidget ref="renamePopup" @renamed="onRename" />
    <DeleteWidget ref="deletePopup" @removed="onDelete" />
    <MoveWidget ref="movePopup" @moved="onMove" />
</template>

<script>
import CreateDirectoryWidget from './CreateDirectoryWidget.vue'
import RenameWidget from './RenameWidget.vue'
import SignalWindow from '@/components/SignalWindow.vue'
import DeleteWidget from './DeleteWidget.vue'
import MoveWidget from "./MoveWidget.vue";
import { DeviceController } from '@/controllers/device'

import { ref, onMounted, computed } from 'vue'
import { mobile } from '@/utils/mobile-checker'


export default {
    components: {
        RenameWidget,
        SignalWindow,
        CreateDirectoryWidget,
        DeleteWidget,
        MoveWidget,
    },
    props: {
        files: {
            type: Array,
            required: true
        },
        actionCreateDirectory: {
            type: Boolean,
            default: true
        },
        actionRename: {
            type: Boolean,
            default: true
        },
        actionMove: {
            type: Boolean,
            default: true
        },
        actionDelete: {
            type: Boolean,
            default: true
        },
        actionInfo: {
            type: Boolean,
            default: true
        },
        actionTransmit: {
            type: Boolean,
            default: true
        },
    },
    emits: [
        'deleted',
        'moved',
        'renamed',
        'directory-created',
        'updated',
        'init'
    ],
    setup(props, { emit, expose }) {
        const { transmitFromFile } = DeviceController();
        const tree = ref([]);
        const fileicons = {
            "json": "code-json",
            "sub": 'flipper-zero'
        }
        const currentFile = ref([]);
        const selectedFiles = ref([]);
        const showUploadWidget = ref(false);
        const expandedDirectories = ref([]);
        expose({
            expandedDirectories: expandedDirectories
        })

        const createDirectoryPopup = ref();
        const openCreateDirectoryPopup = (path) => {
            createDirectoryPopup.value.path = path;
            createDirectoryPopup.value.show();
        }
        const onDirectoryCreated = (event) => {
            emit('directory-created', event.data);
            emit('updated');
        }

        const renamePopup = ref();
        const openRenamePopup = (name, path, fullpath) => {
            renamePopup.value.name = name;
            renamePopup.value.path = path;
            renamePopup.value.fullpath = fullpath;
            renamePopup.value.show();
        }
        const onRename = (event) => {
            emit('renamed', event.data);
            emit('updated');
        }

        const deletePopup = ref();
        const openDeletePopup = (path) => {
            deletePopup.value.path = path;
            deletePopup.value.show();
        }
        const onDelete = (event) => {
            emit('deleted', event.data);
            emit('updated');
        }

        const signalWindow = ref();
        const openSignalWindow = (path) => {
            signalWindow.value.path = path;
            signalWindow.value.show();
        }

        const movePopup = ref();
        const openMovePopup = (name, fullpath) => {
            movePopup.value.name = name;
            movePopup.value.path = fullpath;
            movePopup.value.show();
        }
        const onMove = (event) => {
            emit('moved', event.data);
            emit('updated');
        }

        const transmit = (filename) => transmitFromFile(filename);

        const toggleExpandDirectory = (index) => {
            expandedDirectories.value[index] = !expandedDirectories.value[index];
        }

        const getFileIconByName = computed(() => (filename) => fileicons[filename.split('.').pop().toLowerCase()] || 'file-outline');

        onMounted(() => emit('init'));

        return {
            tree,
            fileicons,
            currentFile,
            selectedFiles,
            createDirectoryPopup,
            renamePopup,
            deletePopup,
            signalWindow,
            movePopup,
            showUploadWidget,
            expandedDirectories,
            mobile,
            getFileIconByName,
            openSignalWindow,
            openCreateDirectoryPopup,
            openRenamePopup,
            openDeletePopup,
            openMovePopup,
            onDirectoryCreated,
            onMove,
            onRename,
            onDelete,
            toggleExpandDirectory,
            transmit,
        };
    }
}
</script>
