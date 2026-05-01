import { useState, useEffect } from 'react'
import { collection, getDocs, doc, getDoc, query, where, documentId } from 'firebase/firestore'
import { db } from '../firebase'
import type { Wildlife } from '../types'

export function useWildlife() {
  const [wildlife, setWildlife] = useState<Wildlife[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    getDocs(collection(db, 'wildlife'))
      .then(snap => {
        setWildlife(snap.docs.map(d => ({ id: d.id, ...d.data() } as Wildlife)))
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { wildlife, loading, error }
}

export function useWildlifeById(id: string | null) {
  const [animal, setAnimal] = useState<Wildlife | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) { setAnimal(null); return }
    setLoading(true)
    getDoc(doc(db, 'wildlife', id))
      .then(d => setAnimal(d.exists() ? ({ id: d.id, ...d.data() } as Wildlife) : null))
      .finally(() => setLoading(false))
  }, [id])

  return { animal, loading }
}

export function useWildlifeByIds(ids: string[]) {
  const [wildlife, setWildlife] = useState<Wildlife[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ids.length) { setWildlife([]); return }
    setLoading(true)
    // Firestore 'in' supports up to 30 items; chunk if needed
    const chunks: string[][] = []
    for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30))
    Promise.all(
      chunks.map(chunk =>
        getDocs(query(collection(db, 'wildlife'), where(documentId(), 'in', chunk)))
          .then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() } as Wildlife)))
      )
    )
      .then(results => setWildlife(results.flat()))
      .finally(() => setLoading(false))
  }, [ids.join(',')])

  return { wildlife, loading }
}
