<template>
  <div>
    <v-dialog v-model="edit.show" v-on:keydown="_onKeys" aria-role="dialog"  aria-modal>
      <v-card>
        <v-card-title>Edit task</v-card-title>
        <v-card-text>
          <v-textarea v-model="edit.text"></v-textarea>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click.prevent="editCancel">Cancel</v-btn>
          <v-btn color="primary" text @click.prevent="editOk">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <todo-txt-task class="d-flex flex-row" v-for="task in taskList.items" v-bind:key="task.index"
      :value="task" @input="update" @open="editOpen" @remove="remove" />
  </div>
</template>

<script>
import { TaskList } from 'todo-txt-ts';
import TodoTxtTask from './TodoTxtTask.vue';
import Constants from '@/classes/constants';
import Application from '@/classes/application';

export default {
  components: {TodoTxtTask},
  name: 'TodoTxtEditor',

  props: {
    autofocus: Boolean,
    value: Buffer,
  },

  created() {
    this.load();
  },

  data() {
    return {
      edit: {
        show: false,
        task: null,
        text: null
      },
      taskList: {
        items: []
      }
    };
  },

  methods: {
    _onKeys(event) {
      if (event.keyCode === Constants.Keys.escape) {
        // We need to set this to false in the future otherwise the
        // document handlers will see it immediately - even with
        // $nextTick()
        window.setTimeout(() => {
          Application.isDialogActive = false;
        }, 100);
      }
    },

    editCancel() {
      this.edit = {
        show: false,
        task: null,
        text: null
      };
      Application.isDialogActive = this.edit.show;
    },

    editOk() {
      this.edit.task.load(this.edit.text);
      this.editCancel();
      this.update();
      Application.isDialogActive = this.edit.show;
    },

    editOpen(task) {
      this.edit = {
        show: true,
        task: task,
        text: task.stringify()
      };
      Application.isDialogActive = this.edit.show;
    },

    load() {
      if (this.value) {
        this.taskList = TaskList.parse(this.value.toString());
        this.refresh();
      }
    },

    refresh() {
      this.taskList.sort(
        'isComplete',
        'priority',
        { field: 'creationDate', direction: 'desc' },
        'body');
    },

    remove(task) {
      this.taskList.remove(task);
      this.update();
    },

    update() {
      this.refresh();
      this.$emit('input', Buffer.from(this.taskList.stringify()));
    }
  }
};
</script>