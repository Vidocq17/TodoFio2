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
  status: 'En cours',
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

const completedMessage = ref('')
let messageTimeout = null

const saveEdit = async () => {
  if (!editingTask.value || editingTask.value.id == null) return

  const wasDoneBefore = taskStore.tasks.find(t => t.id === editingTask.value.id)?.status === 'Terminée'
  const willBeDoneNow = editingTask.value.status === 'Terminée'

  await taskStore.updateTask(editingTask.value.id, editingTask.value)

  // Si la tâche vient d'être terminée (et ne l'était pas avant)
  if (!wasDoneBefore && willBeDoneNow) {
    const randomIndex = Math.floor(Math.random() * taskDonesMessages.length)
    completedMessage.value = taskDonesMessages[randomIndex]

    clearTimeout(messageTimeout)
    messageTimeout = setTimeout(() => {
      completedMessage.value = ''
    }, 3000) // message affiché 3 secondes
  }

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
  if (t.status === 'Terminée') return { backgroundColor: 'lightgreen' }
  return t.importance === 'Urgent'
    ? { backgroundColor: 'rgb(246 142 142)' }
    : { backgroundColor: 'rgb(255 225 235)' }
}

const importanceFilter = ref('Tous')

const filteredTasks = computed(() => {
  if (importanceFilter.value === 'Tous') return taskStore.tasks
  return taskStore.tasks.filter(task => task.importance === importanceFilter.value)
})

const sortedTasks = computed(() =>
  [...filteredTasks.value].sort((a, b) => {
    if (a.importance === b.importance) return 0
    return a.importance === 'Urgent' ? -1 : 1
  })
)

const howmanyTask = computed(() => taskStore.tasks.length)
const howmanyTaskDone = computed(() => taskStore.tasks.filter(t => t.status === 'Terminée').length)
const howmanyTaskNotDone = computed(() => taskStore.tasks.filter(t => t.status !== 'Terminée').length)

const taskDonesMessages = [
  "Bravo ma vie, tu gères ! 🎉",
  "Continue comme ça, tu es au top ! 🚀",
  "Chaque tâche terminée est une victoire ! 🏆",
  "Tu es une machine à tâches ! 💪",
  "Félicitations pour ton efficacité ! 🌟",
  "T'es une vraie boss ! 💼🔥",
  "Même Batman serait jaloux ! 🦇",
  "Trop forte ! Encore une mission accomplie ! 🧨",
  "C’est plié comme du linge ! 🧺",
  "T'as géré ça comme une queen 👑",
  "Ma WonderWoman ! 🦸‍♀️",
  "T'as mis le feu à ta to-do list ! 🔥",
  "Ah si tu retirais mes vêtements aussi efficacement ! 😉",
  "Ah si tu mettais autant d'énergie pour laver l'appart ! On mangerait par terre ! 😂",
  "Ah si tu pouvais faire disparaître la poussière comme ça ! 🧹",
  "Arrête d'être aussi productive, on va finir par croire que tu te dopes ! 💉",
  "T'as un doctorat en gestion de tâches ou quoi ? 🎓",
  "T'es tellement efficace que t'as dû vendre ton âme au diable ! 😈 remarque tu pourras t'habiller en Prada 💁🏻‍♀️",
  "On va finir par t'appeler la Bemont des tâches ! (t'as compris ? démon / Bemont... eh on s'amuse comme on peut hein)",
]

const sobriquets = [
  "douce tornade",
  "ma petite tornade d’amour",
  "fée du logis digital",
  "CEO de la productivité",
  "impératrice des listes",
  "ma WonderWoman en legging",
  "super-héroïne sans cape (mais avec un café)",
  "machine à cocher des cases",
  "cheffe de projet de l’univers",
  "fléau des tâches",
  "divinité du multitâche",
  "commando de l’efficacité",
  "charmante furie organisée",
  "reine des deadlines",
  "goddess de la to-do list",
  "torpille du planning",
  "ma bombe atomique de la gestion",
  "perle de l'organisation",
  "détentrice du fessier divin",
  "reine de sous la couette",
  
]

const sobriquet = ref('')

function pickRandomSobriquet() {
  const index = Math.floor(Math.random() * sobriquets.length)
  sobriquet.value = sobriquets[index]
}

onMounted(() => {
  pickRandomSobriquet() // dès le chargement
  setInterval(pickRandomSobriquet, 5 * 60 * 1000) // toutes les 5 min
})


</script>

<template>
  <div class="task-manager">
    <h2>❤️ Les tâches de Fiona ❤️</h2>

    <div class="filter-bar">
      <label>Filtrer par importance :</label>
      <select v-model="importanceFilter">
        <option>Tous</option>
        <option>Urgent</option>
        <option>Peu important</option>
      </select>
    </div>


    <form @submit.prevent="handleAddTask" class="task-form">
      <input v-model="newTask.nom" placeholder="Nom de la tâche" required />
      <textarea v-model="newTask.description" placeholder="Description"></textarea>
      <select v-model="newTask.status">
        <option>En cours</option>
        <option>Terminée</option>
      </select>
      <select v-model="newTask.importance">
        <option>Peu important</option>
        <option>Urgent</option>
      </select>
      <input v-model="newTask.deadline" type="date" />
    </form>
    <button type="submit" id="submit" :class="[isValid ? 'enabled' : 'disabled']"
      @click="handleAddTask">Ajouter
    </button>

<div class="blabla">
  <p>
    💌 {{ sobriquet }},, il te reste
    <strong>{{ howmanyTaskNotDone }}</strong>
    tâche{{ howmanyTaskNotDone === 1 ? '' : 's' }} à dompter
    <span v-if="howmanyTaskNotDone === 0">... et c’est déjà fait ? 😱 Incroyable.</span>
    <span v-else-if="howmanyTaskNotDone < 3">... presque la fin, t’es une fusée ! 🚀</span>
    <span v-else>... courage, t’as déjà survécu à moi, tu peux tout faire 💪</span>
  </p>

  <p>
    ✅ Tâche{{ howmanyTaskDone === 1 ? '' : 's' }} terminée{{ howmanyTaskDone === 1 ? '' : 's' }} :
    <strong>{{ howmanyTaskDone }}</strong>
    — {{ howmanyTaskDone === 0 ? "Bon… faut peut-être s’y mettre 🐌" :
    howmanyTaskDone < 3 ? "ça commence à sentir la productivité 👏" :
    "t’as plié ta to-do comme une chef ! 👑" }}
  </p>

  <p>
    📦 Total :
    {{ howmanyTask }} mission{{ howmanyTask === 1 ? '' : 's' }} confiée{{ howmanyTask === 1 ? '' : 's' }} à la guerrière du quotidien 💼🔥
  </p>
</div>


    <transition name="message-fade">
      <div v-if="completedMessage" class="big-congrats-message">
        {{ completedMessage }}
      </div>
    </transition>

    <div class="task-list">
      <transition-group name="fade" tag="div">
        <div v-for="task in sortedTasks" :key="task.id" class="task-card" :style="getBackgroundImportance(task)">
          <div class="info-card">

            <!-- NOM -->
            <template v-if="editingTask && editingTask.id === task.id">
              <input v-model="editingTask.nom" />
            </template>
            <template v-else>
              <h3 :class="[task.status === 'Terminée' ? 'taskDone' : '']">{{ task.nom }}</h3>
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
                <option>En cours</option>
                <option>Terminée</option>
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
              <p v-if="task.deadline" class="deadline" :class="[isToday(task.deadline) ? 'is-today-date' : '']">
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
      </transition-group>
    </div>
  </div>
</template>
