/**
 * Upload parsed JSON data to Firebase Firestore.
 *
 * Prerequisites:
 *   1. Create a Firebase project and download a service account key JSON.
 *   2. npm install firebase-admin
 *   3. Set env var:  GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
 *
 * Usage:
 *   node scripts/seed_firebase.mjs
 *
 * The script writes in batches of 500 to stay within Firestore limits.
 * Running it a second time will overwrite existing documents (idempotent).
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

// ── Init ─────────────────────────────────────────────────────────────────────

const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (!credPath) {
  console.error('Error: GOOGLE_APPLICATION_CREDENTIALS env var not set.')
  console.error('Set it to the path of your Firebase service account JSON key.')
  process.exit(1)
}

initializeApp({ credential: cert(credPath) })
const db = getFirestore()

// ── Batch writer ──────────────────────────────────────────────────────────────

async function batchWrite(collectionName, docs, idField = 'id') {
  const BATCH_SIZE = 499
  let count = 0

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const chunk = docs.slice(i, i + BATCH_SIZE)
    const batch = db.batch()
    for (const doc of chunk) {
      const { [idField]: docId, ...data } = doc
      const ref = db.collection(collectionName).doc(String(docId))
      batch.set(ref, data)
    }
    await batch.commit()
    count += chunk.length
    process.stdout.write(`  ${collectionName}: ${count}/${docs.length}\r`)
  }
  console.log(`  ${collectionName}: ${count} documents written.`)
}

// ── Auto-ID batch writer (no id field) ───────────────────────────────────────

async function batchWriteAutoId(collectionName, docs) {
  const BATCH_SIZE = 499
  let count = 0

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const chunk = docs.slice(i, i + BATCH_SIZE)
    const batch = db.batch()
    for (const doc of chunk) {
      const ref = db.collection(collectionName).doc()
      batch.set(ref, doc)
    }
    await batch.commit()
    count += chunk.length
    process.stdout.write(`  ${collectionName}: ${count}/${docs.length}\r`)
  }
  console.log(`  ${collectionName}: ${count} documents written.`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const protectedAreas = JSON.parse(readFileSync(join(DATA_DIR, 'protected_areas.json'), 'utf-8'))
  const wildlife = JSON.parse(readFileSync(join(DATA_DIR, 'wildlife.json'), 'utf-8'))
  const sightings = JSON.parse(readFileSync(join(DATA_DIR, 'sightings.json'), 'utf-8'))

  console.log('Uploading to Firestore...\n')

  await batchWrite('protectedAreas', protectedAreas)
  await batchWrite('wildlife', wildlife)
  await batchWriteAutoId('wildlifeSightings', sightings)

  console.log('\nAll data uploaded successfully.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
