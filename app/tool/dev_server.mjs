// Servidor web de desenvolvimento com auto reload: sobe `flutter run -d web-server`
// e dispara hot restart sempre que algo em lib/ ou assets/ muda.
// Uso (na pasta app/): node tool/dev_server.mjs [porta]
import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = process.argv[2] ?? '5500';
const DEBOUNCE_MS = 800;
const RESPAWN_DELAY_MS = 1500;

let flutter;
let shuttingDown = false;

// O flutter encerra quando o hot restart estoura o tempo (ex.: aba do navegador em segundo
// plano não responde); nesse caso o servidor sobe de novo e basta recarregar a página.
function startFlutter() {
  flutter = spawn(
    'flutter',
    ['run', '-d', 'web-server', '--web-port', port, '--web-hostname', '0.0.0.0'],
    { cwd: appDir, stdio: ['pipe', 'inherit', 'inherit'], shell: true },
  );
  flutter.on('exit', (code) => {
    if (shuttingDown) {
      process.exit(code ?? 0);
      return;
    }
    console.log(`\n[auto-reload] flutter encerrou (código ${code}); subindo de novo...`);
    setTimeout(startFlutter, RESPAWN_DELAY_MS);
  });
}

let timer;
let pending = new Set();

function scheduleRestart(file) {
  pending.add(file);
  clearTimeout(timer);
  // Espera as edições em vários arquivos terminarem antes de recompilar.
  timer = setTimeout(() => {
    const changed = [...pending].join(', ');
    pending = new Set();
    if (flutter?.exitCode !== null) return;
    console.log(`\n[auto-reload] mudança em ${changed} -> hot restart`);
    flutter.stdin.write('R');
  }, DEBOUNCE_MS);
}

for (const dir of ['lib', 'assets']) {
  watch(path.join(appDir, dir), { recursive: true }, (_event, file) => {
    if (file) scheduleRestart(`${dir}/${file.replaceAll('\\', '/')}`);
  });
}

function shutdown() {
  shuttingDown = true;
  clearTimeout(timer);
  flutter?.stdin.write('q');
  setTimeout(() => process.exit(0), 3000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
startFlutter();
