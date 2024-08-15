<template>
    <PageLayout>
        <template v-slot:actions-top>
            <Toolbar class="mt-0">
                <template #start>
                    <Button @click="reloadFiles" severity="info" outlined size="small" class="font-medium">
                        <e-icon icon="refresh" size="small" prepended />
                        Refresh
                    </Button>
                </template>
                <template #end>
                    <Button @click="showUploadWidget = !showUploadWidget" severity="info" size="small" outlined
                        class="font-medium">
                        <template v-if="showUploadWidget">
                            <e-icon icon="close" size="small" prepended /> Close upload
                        </template>
                        <template v-else>
                            <e-icon icon="upload-outline" size="small" prepended /> Upload
                        </template>
                    </Button>
                </template>
            </Toolbar>
            <div class="mt-2" v-show="showUploadWidget">
                <UploadWidget></UploadWidget>
            </div>
        </template>
        <template v-slot:content>
            <FilesList :files="filesTree" ref="filesListWidget" @updated="reloadFiles" @init="initFilesList" />
        </template>
    </PageLayout>
</template>

<script>
import { useStore } from '@/store/store'
import PageLayout from '../layouts/main/Page.vue'
import FilesList from "@/components/FileManager/FilesList.vue";
import UploadWidget from "@/components/FileManager/UploadWidget.vue";
import { ref, computed, onMounted, watch } from 'vue'
import { DeviceController } from '@/controllers/device'

export default {
    components: {
        FilesList,
        UploadWidget,
        PageLayout,
    },
    setup() {
        const device = DeviceController();
        const tree = ref([]);
        const fileicons = {
            "tut-json": "code-json",
            "sub": 'flipper-zero'
        }
        const currentFile = ref([]);
        const selectedFiles = ref([]);

        const store = useStore();
        const recordedSignals = store.recordedSignals;

        const showUploadWidget = ref(false);

        const filesListWidget = ref(null);

        const initFilesList = () => {
            filesListWidget.value.expandedDirectories = store.state.recorded.signals.expandedDirectories;
        };

        const recordedSignalsListChanged = computed(() => store.recordedSignals.changed);

        onMounted(() => {
            if (!recordedSignals.loaded || recordedSignalsListChanged) {
                reloadFiles();
            }
        });



        const reloadFiles = () => {
            device.requestRecordedSignals();
        }

        watch(recordedSignalsListChanged, (newValue) => { if (newValue) reloadFiles() });

        const mapFilesToTree = (files, fullpath = '') => {
            return files.map(file => {
                const fileFullpath = fullpath !== '' ? fullpath + '/' + file.name : file.name;
                if (file.type === 'directory') {
                    return {
                        key: fileFullpath,
                        label: file.name,
                        data: { name: file.name, type: 'directory', fullpath: fileFullpath, directory: fullpath },
                        type: 'directory',
                        children: mapFilesToTree(file.contains, fileFullpath),
                    }
                }
                return {
                    key: fileFullpath,
                    label: file.name,
                    type: 'file',
                    data: { name: file.name, type: 'file', fullpath: fileFullpath, directory: fullpath },
                }
            });
        }

        const filesTree = computed(() => {
            return mapFilesToTree([
                {
                    name: '',
                    type: 'directory',
                    contains: recordedSignals.files,
                }
            ]);
        });

        return {
            recordedSignals,
            tree,
            fileicons,
            currentFile,
            filesTree,
            selectedFiles,
            showUploadWidget,
            filesListWidget,
            reloadFiles,
            initFilesList,
        };
    }
}
</script>
