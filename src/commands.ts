interface Command {
  cmd: string,
  description: string,
  hide?: boolean
}

function createCommand(cmd: string, description: string, hide = false): Command {
  return { cmd, description, hide }
}

export const commands = {
  START: createCommand('/start', '打个招呼'),
  HELP: createCommand('/help', '使用帮助'),
}
