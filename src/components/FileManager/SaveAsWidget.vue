<template>
    <Dialog v-model:visible="visible" modal position="top" class="w-full max-w-96">
        <template #header>
            <span class="align-start">
                <e-icon icon="content-save-outline" size="small" /> <span class="align-top font-bold">Save as</span>
            </span>
        </template>
        <InputText id="filename" v-model="filename" placeholder="Name" class="w-full" />

        <div class="m-2 mt-5 font-bold">
            Save to
        </div>
        <Tree v-if="!loading" v-model:expandedKeys="expandedKeys" v-model:selectionKeys="selectedKey" @nodeSelect="selectDir"
            @nodeUnselect="unselectDir" :value="directories" selectionMode="single" class="w-full md:w-30rem">
            <template #default="slotProps">
                <e-icon :icon="slotProps.node.icon" size="small" prepended /> {{ slotProps.node.label !== '' ?
                    slotProps.node.label : 'root' }}
            </template>
        </Tree>
        <div  v-else class="card flex justify-content-center">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" fill="var(--surface-ground)" aria-label="Custom ProgressSpinner" />
        </div>


        <template #footer>
            <Button severity="primary" @click="save" :disabled="!isValid">Save</Button>
            <Button severity="secondary" @click="visible = false">Close</Button>
        </template>
    </Dialog>
</template>

<script>
import { useStore } from '@/store/store'
import { computed, onMounted, ref } from 'vue';
import { DeviceController } from '@/controllers/device'

export default {
    setup(props, { emit, expose }) {
        const store = useStore()
        const device = DeviceController();
        const visible = ref(false);
        const path = ref('');
        const filename = ref('');
        const selectedKey = ref('');
        const expandedKeys = ref([]);
        const content = ref();
        const loading = ref(false);

        const mapFilesToTree = (files, index = '', fullpath = '') => {
            let localIndex = 0;
            return files.filter((file) => {
                const fileFullpath = fullpath !== '' ? fullpath + '/' + file.name : file.name;

                return file.type === 'directory'
            }).map(file => {
                const fileFullpath = fullpath !== '' ? fullpath + '/' + file.name : file.name;
                return {
                    key: index !== '' ? index + '-' + localIndex++ : localIndex,
                    label: file.name,
                    data: { name: file.name, fullpath: fileFullpath, directory: fullpath },
                    icon: 'folder-outline',
                    type: 'directory',
                    children: mapFilesToTree(file.contains, index !== '' ? index + '-' + localIndex : localIndex, fileFullpath),
                }
            });
        }

        const directories = computed(() => {
            return mapFilesToTree([
                {
                    name: '',
                    type: 'directory',
                    contains: store.recordedSignals.files,
                }
            ]);
        });

        onMounted(() => {
            expandedKeys.value[0] = true;
        });

        const selectedPath = ref(null);
        const selectDir = (node) => selectedPath.value = node.data.fullpath;
        const unselectDir = () => selectedPath.value = null;

        const show = () => {
            visible.value = true;
            if (!store.recordedSignals.files.length) {
                loading.value = true;
                device.requestRecordedSignals(() => loading.value = false);
            }
        }
        const hide = () => visible.value = false;

        const isValid = computed(() => (selectedPath.value !== null && filename.value))

        const save = async () => {
            if (!isValid.value) return;

            const to = (selectedPath.value === '' ? filename.value : selectedPath.value + '/' + filename.value) + '.sub';

            const file = new File([content.value], to, { type: "text/plain" });

            await device.upload(file);

            path.value = '';
            filename.value = '';
            selectedKey.value = '';
            selectedPath.value = null;
            hide();
            emit('saved', { name: filename, to: to });
        }

        expose({
            show: show,
            hide: hide,
            path: path,
            filename: filename,
            content: content,
        })

        return {
            visible,
            path,
            selectedPath,
            directories,
            selectedKey,
            expandedKeys,
            save,
            selectDir,
            unselectDir,
            filename,
            loading,
            isValid,
        }
    },
}
</script>
