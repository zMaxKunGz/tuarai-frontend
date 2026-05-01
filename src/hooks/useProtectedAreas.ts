import { useState, useEffect } from 'react'
import { collection, getDocs, doc, getDoc, query, where, documentId } from 'firebase/firestore'
import { db } from '../firebase'
import type { ProtectedArea } from '../types'

export function useProtectedAreasByIds(ids: string[]) {
  const [parks, setParks] = useState<ProtectedArea[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ids.length) { setParks([]); return }
    setLoading(true)
    const chunks: string[][] = []
    for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30))
    Promise.all(
      chunks.map(chunk =>
        getDocs(query(collection(db, 'protectedAreas'), where(documentId(), 'in', chunk)))
          .then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() } as ProtectedArea)))
      )
    )
      .then(results => setParks(results.flat()))
      .finally(() => setLoading(false))
  }, [ids.join(',')])

  return { parks, loading }
}

export function useProtectedAreaById(id: string | null) {
  const [park, setPark] = useState<ProtectedArea | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) { setPark(null); return }
    setLoading(true)
    getDoc(doc(db, 'protectedAreas', id))
      .then(d => setPark(d.exists() ? ({ id: d.id, ...d.data() } as ProtectedArea) : null))
      .finally(() => setLoading(false))
  }, [id])

  return { park, loading }
}

export function useAllProtectedAreas() {
  const [parks, setParks] = useState<ProtectedArea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDocs(collection(db, 'protectedAreas'))
      .then(snap => setParks(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProtectedArea))))
      .finally(() => setLoading(false))
  }, [])

  return { parks, loading }
}
