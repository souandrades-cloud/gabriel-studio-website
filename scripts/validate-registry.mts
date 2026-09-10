import { ALL_PROJECTS } from "@/data/projects/registry";
import { validateRegistry } from "@/lib/portfolio/validation";

const issues = validateRegistry(ALL_PROJECTS);

if (issues.length > 0) {
  console.error(`Registry inválido — ${issues.length} issue(s) encontrado(s):\n`);
  for (const issue of issues) {
    const scope = issue.projectId ? ` (${issue.projectId})` : "";
    console.error(`  [${issue.code}]${scope} ${issue.message}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Registry válido — ${ALL_PROJECTS.length} projeto(s) verificado(s), zero issues.`);
}
