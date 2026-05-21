// Repackage the Realms client bundle with the crash-proof auto-link CSM.
// Self-contained + reproducible: extracts the current hosted zip, writes
// the fixed clientmods/pixens_autolink/init.lua, re-zips. No PowerShell.
//
//   node scripts/repack-realms.mjs <src.zip> <out.zip>
//
// The CSM is crash-proof (pcall + nil-guards): a clientmod runtime error
// = "access denied" disconnect, so it must be physically unable to throw.
// `io` is sandboxed out of CSM — the launcher writes `pixens_link_code`
// into the bundle minetest.conf and we read it via core.settings.

import extract from 'extract-zip';
import archiver from 'archiver';
import { createWriteStream, createReadStream, mkdtempSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const SRC = process.argv[2];
const OUT = process.argv[3];
if (!SRC || !OUT) { console.error('usage: repack-realms.mjs <src.zip> <out.zip>'); process.exit(1); }

const CSM_INIT = `-- PIXENS REALMS — auto-link the launcher-chosen Pixen (R41.1, crash-proof).
--
-- \`io\` is sandboxed OUT of the Luanti clientmod env (indexing it throws
-- and the client disconnects with "access denied"). The supported
-- channel is the client Settings: the launcher writes
-- \`pixens_link_code = <tokenId>\` into the bundle's minetest.conf before
-- spawn; we read it via core.settings and run the existing /link once.
-- EVERYTHING is pcall-guarded — this mod must be physically incapable of
-- throwing. Worst case: no auto-link (manual /link <#> + /realm still
-- work); never a crash, never an "access denied".

local sent = false

local function get_code()
  local ok, v = pcall(function()
    if core and core.settings and core.settings.get then
      -- #2: prefer the ownership-verified signed token; fall back to
      -- the legacy raw id (unverified cosmetic; earns no account XP).
      return core.settings:get('pixens_link_token')
          or core.settings:get('pixens_link_code')
    end
    return nil
  end)
  if ok and v then
    v = tostring(v):gsub('%s', '')
    if v ~= '' then return v end
  end
  return nil
end

local function autolink()
  if sent then return end
  pcall(function()
    local code = get_code()
    if not code then return end
    if core and core.send_chat_message then
      core.send_chat_message('/link ' .. code)
      sent = true
    end
  end)
end

pcall(function() if core and core.after then core.after(2.0, autolink) end end)
pcall(function() if core and core.after then core.after(5.0, autolink) end end)
`;

// MENU: ship the PROVEN original branded menu (manual name+password
// form — Grega-verified working). The no-popup auto-connect is NOT done
// in menu Lua: core.start() only works from a menu CALLBACK, never at
// script load-time (init_globals) — an early-return core.start()/
// core.after at load → "Failed to load main menu script!" (and menu
// timing is un-GUI-testable, brains #156). Instead the LAUNCHER passes
// the engine's native, source-confirmed direct-connect CLI (`--go
// --address --port --name --password`, src/main.cpp) so the menu is
// bypassed entirely with zero Lua risk; this menu is only the fallback
// for the standalone exe / bridge-down path.
//
// So the repack REVERTS any prior #2b injection back to the clean
// original (idempotent: clean source → no-op; patched → stripped).
// Match from the stable anchor line lazily to `local function pix_fs()`
// and drop everything between (restores the original single blank line).
const MENU_RE =
  /(\tlocal logo = core\.formspec_escape\(defaulttexturedir \.\. "pixens_logo\.png"\)\n)[\s\S]*?(\n\tlocal function pix_fs\(\))/;

const work = mkdtempSync(join(tmpdir(), 'realmsrepack-'));
console.log('[repack] extract', SRC, '->', work);
await extract(SRC, { dir: work });

const csmPath = join(work, 'clientmods', 'pixens_autolink', 'init.lua');
if (!existsSync(dirname(csmPath))) mkdirSync(dirname(csmPath), { recursive: true });
writeFileSync(csmPath, CSM_INIT, 'utf8');
console.log('[repack] wrote crash-proof CSM', csmPath);

// Revert the menu to the proven original (strip any prior #2b block).
const menuPath = join(work, 'builtin', 'mainmenu', 'init.lua');
{
  const { readFileSync } = await import('node:fs');
  const menu = readFileSync(menuPath, 'utf8');
  if (!MENU_RE.test(menu)) {
    throw new Error('[repack] menu landmarks not found — bundle menu changed; aborting');
  }
  const reverted = menu.replace(MENU_RE, (_m, g1, g2) => g1 + g2);
  if (reverted.includes('#2b auto-connect') || reverted.includes('core.after')) {
    throw new Error('[repack] menu revert sanity failed (stale #2b / core.after remains)');
  }
  writeFileSync(menuPath, reverted, 'utf8');
  console.log(reverted === menu
    ? '[repack] menu already clean (proven original) — no change'
    : '[repack] menu reverted to proven original (stripped #2b block)');
}

await new Promise((resolve, reject) => {
  const out = createWriteStream(OUT);
  const arc = archiver('zip', { zlib: { level: 9 } });
  out.on('close', resolve);
  arc.on('error', reject);
  arc.pipe(out);
  arc.directory(work + '/', false); // contents at archive root (bin/, builtin/, ...)
  arc.finalize();
});

const buf = createReadStream(OUT);
const h = createHash('sha256');
for await (const c of buf) h.update(c);
const { statSync } = await import('node:fs');
console.log('[repack] OUT  :', OUT);
console.log('[repack] size :', statSync(OUT).size);
console.log('[repack] sha256:', h.digest('hex'));
