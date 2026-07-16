#!/usr/bin/env node
/**
 * patch-vercel-build.mjs
 *
 * Nitro deja `import { X } from "tslib"` como import externo en sus chunks
 * pero tslib NO está disponible en el Lambda de Vercel en tiempo de ejecución.
 *
 * Este script recorre TODOS los .mjs del bundle de Vercel y reemplaza cada
 * `import { ... } from "tslib"` con las implementaciones inline de tslib,
 * garantizando que nunca habrá un ERR_MODULE_NOT_FOUND en producción.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ─── Inline implementations de cada helper de tslib ──────────────────────────
const TSLIB_HELPERS = {
  __extends: `var __extends = (this && this.__extends) || (function () { var extendStatics = function (d, b) { extendStatics = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) || function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; }; return extendStatics(d, b); }; return function (d, b) { if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null"); extendStatics(d, b); function __() { this.constructor = d; } d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __()); }; })();`,

  __assign: `var __assign = function() { __assign = Object.assign || function __assign(t) { for (var s, i = 1, n = arguments.length; i < n; i++) { s = arguments[i]; for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]; } return t; }; return __assign.apply(this, arguments); };`,

  __rest: `var __rest = (this && this.__rest) || function (s, e) { var t = {}; for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p]; if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) { if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]]; } return t; };`,

  __decorate: `var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) { var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d; if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r; return c > 3 && r && Object.defineProperty(target, key, r), r; };`,

  __awaiter: `var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) { function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); } return new (P || (P = Promise))(function (resolve, reject) { function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } } function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } } function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); } step((generator = generator.apply(thisArg, _arguments || [])).next()); }); };`,

  __generator: `var __generator = (this && this.__generator) || function (thisArg, body) { var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g; return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g; function verb(n) { return function (v) { return step([n, v]); }; } function step(op) { if (f) throw new TypeError("Generator is already executing."); while (g && (g = 0, op[0] && (_ = 0)), _) try { if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t; if (y = 0, t) op = [op[0] & 2, t.value]; switch (op[0]) { case 0: case 1: t = op; break; case 4: _.label++; return { value: op[1], done: false }; case 5: _.label++; y = op[1]; op = [0]; continue; case 7: op = _.ops.pop(); _.trys.pop(); continue; default: if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; } if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; } if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; } if (t && _.label < t[2]) { _.label = t[2]; t.label = t[3]; break; } t.ops.pop(); _.trys.pop(); continue; } op = body.call(thisArg, _); } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; } if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true }; } };`,

  __read: `var __read = (this && this.__read) || function (o, n) { var m = typeof Symbol === "function" && o[Symbol.iterator]; if (!m) return o; var i = m.call(o), r, ar = [], e; try { while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value); } catch (error) { e = { error: error }; } finally { try { if (r && !r.done && (m = i["return"])) m.call(i); } finally { if (e) throw e.error; } } return ar; };`,

  __spread: `var __spread = (this && this.__spread) || function () { for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i])); return ar; };`,

  __spreadArrays: `var __spreadArrays = (this && this.__spreadArrays) || function () { for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length; for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j]; return r; };`,

  __spreadArray: `var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) { if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) { if (ar || !(i in from)) { if (!ar) ar = Array.prototype.slice.call(from, 0, i); ar[i] = from[i]; } } return to.concat(ar || Array.prototype.slice.call(from)); };`,

  __values: `var __values = (this && this.__values) || function(o) { var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0; if (m) return m.call(o); if (o && typeof o.length === "number") return { next: function () { if (o && i >= o.length) o = void 0; return { value: o && o[i++], done: !o }; } }; throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined."); };`,

  __importStar: `var __importStar = (this && this.__importStar) || (function () { var ownProp = Object.prototype.hasOwnProperty; return function (mod) { if (mod && mod.__esModule) return mod; var result = {}; if (mod != null) for (var k in mod) if (k !== "default" && ownProp.call(mod, k)) result[k] = mod[k]; result["default"] = mod; return result; }; })();`,

  __importDefault: `var __importDefault = (this && this.__importDefault) || function (mod) { return (mod && mod.__esModule) ? mod : { "default": mod }; };`,

  __classPrivateFieldGet: `var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) { if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter"); if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it"); return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver); };`,

  __classPrivateFieldSet: `var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) { if (kind === "m") throw new TypeError("Private method is not writable"); if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter"); if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it"); return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value; };`,

  __createBinding: `var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) { if (k2 === undefined) k2 = k; var desc = Object.getOwnPropertyDescriptor(m, k); if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) { desc = { enumerable: true, get: function() { return m[k]; } }; } Object.defineProperty(o, k2, desc); }) : (function(o, m, k, k2) { if (k2 === undefined) k2 = k; o[k2] = m[k]; }));`,
};

// ─── Recorre todos los .mjs del bundle recursivamente ────────────────────────
function findMjsFiles(dir, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      findMjsFiles(full, results);
    } else if (entry.name.endsWith('.mjs')) {
      results.push(full);
    }
  }
  return results;
}

const funcDir = join(root, '.vercel/output/functions/__server.func');

if (!existsSync(funcDir)) {
  console.error('[patch-vercel] No se encontró el directorio del bundle:', funcDir);
  process.exit(1);
}

const mjsFiles = findMjsFiles(funcDir);
const importRegex = /^import\s*\{([^}]+)\}\s*from\s*["']tslib["'];?[ \t]*$/gm;

let patchedFiles = 0;

for (const filePath of mjsFiles) {
  let content = readFileSync(filePath, 'utf8');

  if (!content.includes('tslib')) continue;

  const matches = [...content.matchAll(importRegex)];
  if (matches.length === 0) continue;

  const inlinedHelpers = [];

  for (const match of matches) {
    const importedNames = match[1]
      .split(',')
      .map(s => s.trim().replace(/\s+as\s+\S+/, '')) // handle "X as Y" aliases
      .filter(Boolean);

    for (const name of importedNames) {
      if (TSLIB_HELPERS[name]) {
        inlinedHelpers.push(TSLIB_HELPERS[name]);
      } else {
        console.warn(`[patch-vercel] ⚠️  Helper desconocido de tslib: "${name}" en ${filePath.replace(root, '.')}`);
        // Fallback: create a no-op stub so the file at least loads
        inlinedHelpers.push(`var ${name} = function() {};`);
      }
    }

    // Eliminar la línea de import de tslib
    content = content.replace(match[0], '');
  }

  if (inlinedHelpers.length > 0) {
    const inlineBlock = '// [tslib inlined by patch-vercel-build.mjs]\n' + inlinedHelpers.join('\n') + '\n';
    content = inlineBlock + content;
    writeFileSync(filePath, content, 'utf8');
    patchedFiles++;
    console.log(`[patch-vercel] ✓ Parcheado: ${filePath.replace(root + '/', '')}`);
  }
}

if (patchedFiles === 0) {
  console.log('[patch-vercel] ✓ No se encontraron imports de tslib — nada que parchear.');
} else {
  console.log(`\n[patch-vercel] ✅ ${patchedFiles} archivo(s) parcheado(s). tslib está ahora inline en el bundle.`);
}
