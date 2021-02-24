<template>
  <div>
    <v-btn @click="add" color="blue darken-2" fixed fab bottom right dark>
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-dialog v-model="editShow" v-on:keydown="_onKeys" fullscreen aria-role="dialog"  aria-modal>
      <v-card>
        <v-card-title>Edit task</v-card-title>
        <v-card-text>
          <v-textarea v-model="editText" rows="2"></v-textarea>
        </v-card-text>

        <v-card-actions>
          <v-menu class="pt-2" top offset-y aria-role="list">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on">Priority</v-btn>
            </template>
            <v-list>
              <v-list-item v-for="item in ['A', 'B', 'C', 'D']" :key="item" @click="editPriority(item)">{{item}}</v-list-item>
            </v-list>
          </v-menu>
          <v-btn @click="editComplete">
            {{editText && !editText.startsWith('x ') ? 'Complete' : 'Uncomplete'}}
          </v-btn>
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
import { Task, TaskList } from 'todo-txt-ts';
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
      editShow: false,
      editTask: null,
      editText: null,
      taskList: {
        items: []
      }
    };
  },

  methods: {
    _onKeys(event) {
      if (event.keyCode === Constants.Keys.escape) {
        // We need to set this to false in the future otherwise the document
        // handlers will see it immediately - even with $nextTick()
        window.setTimeout(() => {
          Application.isDialogActive = false;
        }, 100);
      }
    },

    add() {
      this.editOpen(new Task());
    },

    editCancel() {
      this.editShow = false;
      this.editTask = null;
      this.editText = null;
      Application.isDialogActive = this.editShow;
    },

    editComplete() {
      const task = Task.parse(this.editText);
      task.complete(!task.isComplete);
      this.editText = task.stringify();
    },

    editOk() {
      this.editTask.load(this.editText);
      if (this.editTask.index === -1) {
        this.taskList.push(this.editTask);
      }
      this.editCancel();
      this.update();
      Application.isDialogActive = this.editShow;
    },

    editOpen(task) {
      this.editShow = true;
      this.editTask = task;
      this.editText = task.stringify();
      Application.isDialogActive = this.editShow;
    },

    editPriority(priority) {
      const task = Task.parse(this.editText);
      task.priority = priority;
      this.editText = task.stringify();
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