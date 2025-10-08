<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTaskStore } from '@/Stores/useTaskStore'
import { toast } from 'vue3-toastify'

const taskStore = useTaskStore()

const todayDate = new Date().toISOString().split('T')[0]

const isValid = computed(() => newTask.value.nom.trim() !== '')

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR')
}

const isToday = (deadline) => {
  const d = typeof deadline === 'string' ? deadline : deadline.toISOString().split('T')[0]
  return d === todayDate
}

const emptyTask = () => ({
  nom: '',
  description: '',
  status: 'en cours',
  importance: 'Urgent',
  deadline: undefined,
})

const newTask = ref(emptyTask())
const editingTask = ref(null)

const handleAddTask = async () => {
  if (!newTask.value.nom) return
  await taskStore.addTask({ ...newTask.value })
  newTask.value = emptyTask()
}

const editTask = (task) => {
  editingTask.value = { ...task }
  toast.info('Modification de la tâche')
}

const saveEdit = async () => {
  if (!editingTask.value || editingTask.value.id == null) return
  await taskStore.updateTask(editingTask.value.id, editingTask.value)
  editingTask.value = null
}

const cancelEdit = () => {
  editingTask.value = null
  toast.warn('Modification annulée')
}

onMounted(() => {
  taskStore.fetchTasks()
})

const getBackgroundImportance = (t) => {
  if (t.status === 'terminée') return { backgroundColor: 'lightgreen' }
  return t.importance === 'Urgent'
    ? { backgroundColor: 'rgb(246 142 142)' }
    : { backgroundColor: 'rgb(255 225 235)' }
}
</script>

<template>
  <div class="task-manager">
    <h2>❤️ Les tâches de Fiona ❤️</h2>

    <form @submit.prevent="handleAddTask" class="task-form">
      <input v-model="newTask.nom" placeholder="Nom de la tâche" required />
      <textarea v-model="newTask.description" placeholder="Description"></textarea>
      <select v-model="newTask.status">
        <option>en cours</option>
        <option>terminée</option>
      </select>
      <select v-model="newTask.importance">
        <option>Peu important</option>
        <option>Urgent</option>
      </select>
      <input v-model="newTask.deadline" type="date" />
    </form>
    <button type="submit" id="submit" :class="[isValid ? 'enabled' : 'disabled']" @click="handleAddTask">Ajouter</button>

    <div class="task-list">
      <div
        v-for="task in taskStore.tasks"
        :key="task.id"
        class="task-card"
        :style="getBackgroundImportance(task)"
      >
        <div class="info-card">

          <!-- NOM -->
          <template v-if="editingTask && editingTask.id === task.id">
            <input v-model="editingTask.nom" />
          </template>
          <template v-else>
            <h3 :class="[task.status === 'terminée' ? 'taskDone' : '']">{{ task.nom }}</h3>
          </template>

          <!-- DESCRIPTION -->
          <template v-if="editingTask && editingTask.id === task.id">
            <textarea v-model="editingTask.description"></textarea>
          </template>
          <template v-else>
            <p>{{ task.description }}</p>
          </template>

          <!-- IMPORTANCE -->
          <template v-if="editingTask && editingTask.id === task.id">
            <select v-model="editingTask.importance">
              <option>Peu important</option>
              <option>Urgent</option>
            </select>
          </template>
          <template v-else>
            <p class="status">Importance : {{ task.importance === 'Urgent' ? '🔥' : '💤' }}</p>
          </template>

          <!-- STATUT -->
          <template v-if="editingTask && editingTask.id === task.id">
            <select v-model="editingTask.status">
              <option>en cours</option>
              <option>terminée</option>
            </select>
          </template>
          <template v-else>
            <p class="status">Statut : {{ task.status }}</p>
          </template>

          <!-- DEADLINE -->
          <template v-if="editingTask && editingTask.id === task.id">
            <input v-model="editingTask.deadline" type="date" />
          </template>
          <template v-else>
            <p
              v-if="task.deadline"
              class="deadline"
              :class="[isToday(task.deadline) ? 'is-today-date' : '']"
            >
              Deadline : {{ formatDate(task.deadline) }} - 
              <span v-if="isToday(task.deadline)">
              Attention ma vie c'est pour aujourd'hui ! 😱
              </span>
            </p>
          </template>
        </div>

        <!-- ACTIONS -->
        <div class="actions">
          <template v-if="editingTask && editingTask.id === task.id">
            <button @click="saveEdit" style="background-color: lightgreen;">💾 Enregistrer</button>
            <button @click="cancelEdit" style="background-color: orange;">❌ Annuler</button>
          </template>
          <template v-else>
            <button @click="editTask(task)" style="background-color: yellow;">✏️ Modifier</button>
            <button @click="taskStore.deleteTask(task.id)" style="background-color: red;">🗑️ Supprimer</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
