<template>
  <div class="d-flex flex-row" @click="$emit('open', task)">
    <div>
      <v-checkbox @change="complete" v-model="task.isComplete" />
    </div>
    <div class="text-h5 pl-2" :style="{ color: priorityColor() }">
      ({{ task.priority }})
    </div>
    <div class="pl-2" :style="{ 'text-decoration': task.isComplete ? 'line-through' : ''}">
      <div class="text-h6">
        {{ task.body }}
        <span class="secondary">
          {{ task.contexts.map(p => `@${p}`).join(' ') }}
        </span>
        <span class="secondary">
          {{ task.projects.map(p => `+${p}`).join(' ') }}
        </span>
        <span class="secondary">
          {{ Object.keys(task.fields).map(f => `${f}:${task.fields[f]}`).join(' ') }}
        </span>
      </div>
      <div class="text-caption">Created: {{ date(task.creationDate) }}</div>
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
.v-input--selection-controls {
  margin-top: 0;
}

div.v-input__slot {
  margin-bottom: 0;
}
</style>