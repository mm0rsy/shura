import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function deriveNamespace(repoSlug) {
  // "affaan-m/everything-claude-code" → "everything-claude-code"
  // "alirezarezvani/claude-skills" → "claude-skills"
  return repoSlug.split('/')[1];
}

function filterSkillNames(names, installedNamespaces) {
  if (!installedNamespaces.length) return [];
  return names.filter(name => installedNamespaces.includes(name.split(':')[0]));
}

function filterSpecialistRoles(roles, installedNamespaces) {
  const result = {};
  for (const [roleName, roleConfig] of Object.entries(roles)) {
    if (roleConfig.source === 'builtin') {
      result[roleName] = roleConfig;
    } else if (installedNamespaces.includes(roleConfig.name.split(':')[0])) {
      result[roleName] = roleConfig;
    }
  }
  return result;
}

async function detectStackType(repoPath) {
  try {
    // 1. claude-code-plugin: .claude-plugin/ directory exists
    if (await exists(path.join(repoPath, '.claude-plugin'))) {
      return 'claude-code-plugin';
    }

    // 2. data-ml: requirements.txt with ML keywords OR *.ipynb files exist
    const reqPath = path.join(repoPath, 'requirements.txt');
    if (await exists(reqPath)) {
      const content = (await fs.readFile(reqPath, 'utf8')).toLowerCase();
      const mlKeywords = ['tensorflow', 'torch', 'sklearn', 'scikit-learn', 'pandas', 'keras', 'jupyter', 'xgboost', 'lightgbm', 'mlflow'];
      if (mlKeywords.some(kw => content.includes(kw))) {
        return 'data-ml';
      }
    }
    const rootFiles = await fs.readdir(repoPath);
    if (rootFiles.some(f => f.endsWith('.ipynb'))) {
      return 'data-ml';
    }

    // 3. mobile: pubspec.yaml (Flutter) OR ios/ + android/ (React Native) OR Podfile (iOS native)
    if (await exists(path.join(repoPath, 'pubspec.yaml'))) {
      return 'mobile';
    }
    if (await exists(path.join(repoPath, 'ios')) && await exists(path.join(repoPath, 'android'))) {
      return 'mobile';
    }
    if (await exists(path.join(repoPath, 'Podfile'))) {
      return 'mobile';
    }

    // 4. cpp: CMakeLists.txt OR *.cmake files in repo root
    if (await exists(path.join(repoPath, 'CMakeLists.txt'))) {
      return 'cpp';
    }
    if (rootFiles.some(f => f.endsWith('.cmake'))) {
      return 'cpp';
    }

    // 5. fullstack: package.json with frontend framework dep AND api/server/backend directory
    const pkgPath = path.join(repoPath, 'package.json');
    const hasPkg = await exists(pkgPath);
    const frontendFrameworks = ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt'];

    let allDeps = {};
    if (hasPkg) {
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
      allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      const hasFrontendDep = frontendFrameworks.some(fw => allDeps[fw] !== undefined || Object.keys(allDeps).some(dep => dep.startsWith(fw + '/')));

      if (hasFrontendDep) {
        const hasServerDir = await exists(path.join(repoPath, 'api')) ||
          await exists(path.join(repoPath, 'server')) ||
          await exists(path.join(repoPath, 'backend'));
        if (hasServerDir) {
          return 'fullstack';
        }
      }
    }

    // 6. frontend: package.json with any frontend framework dep
    if (hasPkg) {
      const frontendAll = ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'gatsby'];
      const hasFrontendDep = frontendAll.some(fw => allDeps[fw] !== undefined || Object.keys(allDeps).some(dep => dep.startsWith(fw + '/')));
      if (hasFrontendDep) {
        return 'frontend';
      }
    }

    // 7. devops: Dockerfile or docker-compose.yml/yaml exists AND package.json does NOT exist
    const hasDockerfile = await exists(path.join(repoPath, 'Dockerfile'));
    const hasDockerCompose = await exists(path.join(repoPath, 'docker-compose.yml')) ||
      await exists(path.join(repoPath, 'docker-compose.yaml'));
    if ((hasDockerfile || hasDockerCompose) && !hasPkg) {
      return 'devops';
    }

    // 8. python: requirements.txt OR setup.py OR pyproject.toml exists
    if (await exists(path.join(repoPath, 'requirements.txt')) ||
      await exists(path.join(repoPath, 'setup.py')) ||
      await exists(path.join(repoPath, 'pyproject.toml'))) {
      return 'python';
    }

    // 9. backend — default fallback
    return 'backend';
  } catch {
    return 'backend';
  }
}

export async function detectStack(repoPath, skillRepos = []) {
  const stack = await detectStackType(repoPath);

  let skillMap = {};
  try {
    const mapPath = path.join(__dirname, 'skill-map.json');
    skillMap = JSON.parse(await fs.readFile(mapPath, 'utf8'));
  } catch {
    // skill-map not found — return stack with empty skill/role data
  }

  const entry = skillMap[stack] || { must_use: [], recommended: [], specialist_roles: {} };
  const installedNamespaces = skillRepos.map(deriveNamespace);

  return {
    stack,
    must_use_skills: filterSkillNames(entry.must_use || [], installedNamespaces),
    recommended_skills: filterSkillNames(entry.recommended || [], installedNamespaces),
    specialist_roles: filterSpecialistRoles(entry.specialist_roles || {}, installedNamespaces),
  };
}
