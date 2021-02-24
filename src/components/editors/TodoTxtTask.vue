<template>
  <div class="d-flex flex-row">
    <div>
      <v-checkbox v-on:click.stop @change="complete" v-model="task.isComplete" />
    </div>
    <div class="text-h5 pl-2" :style="{ color: priorityColor() }">
      ({{ task.priority || '--' }})
    </div>
    <div class="task-body pl-2" @click="$emit('open', task)" :style="{ 'text-decoration': task.isComplete ? 'line-through' : ''}">
      <div class="text-h6" style="word-break: break-word;">
        {{ task.body }}
        <span class="context mr-1">
          {{ task.contexts.map(p => `@${p}`).join(' ') }}
        </span>
        <span class="project mr-1">
          {{ task.projects.map(p => `+${p}`).join(' ') }}
        </span>
        <span class="field mr-1">
          {{ Object.keys(task.fields).map(f => `${f}:${task.fields[f]}`).join(' ') }}
        </span>
      </div>
      <div v-if="!task.isComplete && task.creationDate" class="text-caption">Created: {{ date(task.creationDate) }}</div>
      <div v-if="task.isComplete && task.completionDate" class="text-caption">Completed: {{ date(task.completionDate) }}</div>
    </div>
    <div class="ml-auto"><v-icon @click="$emit('remove', task)">mdi-delete</v-icon></div>
  </div>  
</template>

<script>
import { DateTime } from 'luxon';

export default {
  props: {
    /** @type {Task} */
    value: Object
  },

  data() {
    return {
      task: this.value
    };
  },

  methods: {
    complete(val) {
      this.task.complete(val);
      this.update();
    },

    date(dt) {
      return DateTime.fromJSDate(dt).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
    },

    priorityColor() {
      switch (this.task.priority) {
        case 'A':
          return '#ff0000';
        case 'B':
          return '#ffbb00';
        case 'C':
          return '#00ff00';
        case 'D':
          return '#4444ff';
        default:
          return '#808080';
      }
    },

    update() {
      this.$emit('input', this.task);
    }
  }
};
</script>

<style scoped>
.task-body {
  cursor: pointer;
}

.v-input--selection-controls {
  margin-top: 0;
}

div.v-input__slot {
  margin-bottom: 0;
}

.field {
  background-color: #b08080;
}
.context {
  background-color: #80b080;
}
.project {
  background-color: #8080b0;
}

</style>