<script setup lang="ts">
  import { defineEmits } from 'vue';
  import { PrinterIcon, PhotoIcon, FilmIcon,DocumentTextIcon,MusicalNoteIcon,GiftIcon,QuestionMarkCircleIcon,TrashIcon} from '@heroicons/vue/20/solid'
  //==================
  const props = defineProps<{
    id: number | string;
    file_name: string;
    extension: string;   // pdf, image, video, etc.
  }>();
  const emit = defineEmits(['fileId']);


  function iconFor(type: string) {
      type = type.toLowerCase()
      if(type == "pdf"){
        return 1; 
      }
      else{
        if(type == "png" || type == "jpg" || type == "svg" || type == "jpeg" || type == "gif"  || type == "bmp"){
            return 2;
        }
        else{
            if(type == "mp4" || type == "mkv" || type == "3gp"){
                return 3;
            }
            else{
            if(type == "txt"){
                return 4;
            }
            else{
                if(type == "mp3" || type == "MP3"){
                    return 5;
                }
                else{
                    if(type == "zip" || type == "ZIP" || type == "rar" || type == "RAR"){
                        return 6;
                    }
                    else{
                        return 7;
                    }
                }
            }
        }
        }
      }    
    }
  //--------------
    const emitFileData = () => {
      // console.log(`child | file id : `,props.id)
      // console.log(`child | file name : `,props.file_name)
      // console.log(`child | file extension : `,props.extension)
      emit('fileId', props.id,props.file_name)
    }
</script>

<template>
  <div class="flex items-start gap-4 p-4 border rounded-xl bg-white shadow-sm hover:bg-gray-50 transition" @click="emitFileData">

    <!-- File type icon -->
    <span class="text-xl leading-none px-1">
      <PrinterIcon v-if="iconFor(extension) == 1" class="size-5" />
      <PhotoIcon v-else-if="iconFor(extension) == 2" class="size-5" />
      <FilmIcon v-else-if="iconFor(extension) == 3" class="size-5" />
      <DocumentTextIcon v-else-if="iconFor(extension) == 4" class="size-5" />
      <MusicalNoteIcon v-else-if="iconFor(extension) == 4" class="size-5" />
      <GiftIcon v-else-if="iconFor(extension) == 6" class="size-5" />
      <QuestionMarkCircleIcon v-else class="size-5" />
    </span>    

    <!-- File name -->
    <span class="flex-1 text-right text-sm">
      {{ file_name }}
    </span>
  </div>
</template>
