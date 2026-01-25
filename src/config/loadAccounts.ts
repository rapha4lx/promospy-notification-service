import fs from 'fs'
import path from 'path'

const SESSIONS_DIR = path.resolve('sessions')

export interface Account {
  id: string
  sessionPath: string
}

export function loadAccountsFromSessions(): Account[] {
  if (!fs.existsSync(SESSIONS_DIR)) {
    return []
  }

  return fs
    .readdirSync(SESSIONS_DIR, { withFileTypes: true })
    .filter(dirent => fs.existsSync(
      path.join(SESSIONS_DIR, dirent.name, 'creds.json')
    ))
    .map(dirent => ({
      id: dirent.name,
      sessionPath: path.join(SESSIONS_DIR, dirent.name)
    }))
}
