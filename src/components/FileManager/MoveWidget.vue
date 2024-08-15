<template>
    <Dialog v-model:visible="visible" modal position="top" class="w-full max-w-96">
        <template #header>
            <span class="align-start">
                <e-icon icon="file-move-outline" size="small"/> Move
            </span>
        </template>
        <div class="mb-2">
            Move <span class="font-light">{{
                path.length > 30 ? `${path.slice(0, 15)}...${path.slice(-15)}` : path
            }} to</span>
        </div>
        <Tree  v-model:expandedKeys="expandedKeys" v-model:selectionKeys="selectedKey" @nodeSelect="selectDir" @nodeUnselect="unselectDir" :value="directories" selectionMode="single"
              class="w-full md:w-30rem">
            <template #default="slotProps">
                <e-icon :icon="slotProps.node.icon" size="small" prepended /> {{ slotProps.node.label !== '' ? slotProps.node.label : 'root' }}
            </template>
        </Tree>

        <template #footer>
            <Button severity="primary" @click="move">Move</Button>
            <Button severity="secondary" @click="visible = false">Close</Button>
        </template>
    </Dialog>
</template>

<script>
import {useStore} from '@/store/store'
import {computed, onMounted, ref} from 'vue';
import { DeviceController } from '@/controllers/device'

export default {
    setup(props, {emit, expose}) {
        const store = useStore()
        const device = DeviceController();
        const visible = ref(false);
        const path = ref('');
        const name = ref('');
        const selectedKey = ref('');
        const expandedKeys = ref([]);

        const mapFilesToTree = (files, index = '', fullpath = '') => {
            let localIndex = 0;
            return files.filter((file) => {
                const fileFullpath = fullpath !== '' ? fullpath + '/' + file.name : file.name;
                const samePath = () => {
                    return fileFullpath.startsWith(path.value) && (fileFullpath === path.value || fileFullpath.slice(path.value.length, path.value.length+1) === '/')
                }
                return file.type === 'directory' && (fileFullpath === '' || !samePath())
            }).map(file => {
                const fileFullpath = fullpath !== '' ? fullpath + '/' + file.name : file.name;
                return {
                    key: index !== '' ? index + '-' + localIndex++ : localIndex,
                    label: file.name,
                    data: {name: file.name, fullpath: fileFullpath, directory: fullpath},
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

        onMounted(() => expandedKeys.value[0] = true);

        const selectedPath = ref(null);
        const selectDir = (node) => selectedPath.value = node.data.fullpath;
        const unselectDir = () => selectedPath.value = null;

        const show = () => visible.value = true;
        const hide = () => visible.value = false;

        const move = () => {
            if (selectedPath.value === null) return;

            const to = selectedPath.value === '' ? name.value : selectedPath.value + '/' + name.value;
            const from = path.value;
            device.rename(from, to);
            path.value = '';
            selectedKey.value = '';
            selectedPath.value = null;
            hide();
            emit('moved', {from: from, to: to});
        }

        expose({
            show: show,
            hide: hide,
            path: path,
            name: name,
        })

        return {
            visible,
            path,
            selectedPath,
            directories,
            selectedKey,
            expandedKeys,
            move,
            selectDir,
            unselectDir,
        }
    },
}
</script>
