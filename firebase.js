const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } = require('firebase/firestore');
const firebaseConfig = require('./firebaseConfig');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function guardarRecordatorio(texto) {
  await addDoc(collection(db, 'recordatorios'), {
    texto,
    fecha: new Date().toISOString(),
    estado: 'pendiente'
  });
}

async function obtenerRecordatorios() {
  const snapshot = await getDocs(collection(db, 'recordatorios'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function marcarHecho(id) {
  const ref = doc(db, 'recordatorios', id);
  await updateDoc(ref, { estado: 'hecho' });
}

async function eliminarRecordatorio(id) {
  const ref = doc(db, 'recordatorios', id);
  await deleteDoc(ref);
}

module.exports = {
  guardarRecordatorio,
  obtenerRecordatorios,
  marcarHecho,
  eliminarRecordatorio
};
