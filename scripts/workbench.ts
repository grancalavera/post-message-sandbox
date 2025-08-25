#!/usr/bin/env tsx

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  rmSync,
  cpSync,
} from "fs";
import { join } from "path";

interface ExperimentTemplate {
  name: string;
  description: string;
  number: string;
}

function getNextExperimentNumber(): string {
  const experimentDirs = readdirSync(".")
    .filter(
      (dir: string) =>
        dir.startsWith("experiment-") && statSync(dir).isDirectory(),
    )
    .map((dir: string) => parseInt(dir.replace("experiment-", ""), 10))
    .filter((num: number) => !isNaN(num))
    .sort((a: number, b: number) => a - b);

  const nextNumber =
    experimentDirs.length > 0 ? Math.max(...experimentDirs) + 1 : 1;
  return nextNumber.toString().padStart(2, "0");
}

function createExperiment(name: string): void {
  const experimentNumber = getNextExperimentNumber();
  const experimentName = `experiment-${experimentNumber}`;
  const experimentDir = join(".", experimentName);

  if (existsSync(experimentDir)) {
    console.error(
      `Error: Experiment directory ${experimentName} already exists`,
    );
    process.exit(1);
  }

  const template: ExperimentTemplate = {
    name,
    description: name,
    number: experimentNumber,
  };

  // Create experiment directory structure
  mkdirSync(experimentDir, { recursive: true });
  mkdirSync(join(experimentDir, "src"), { recursive: true });

  // Create files from templates
  createFromTemplate("index.html", join(experimentDir, "index.html"), template);
  createFromTemplate(
    "main.tsx",
    join(experimentDir, "src", "main.tsx"),
    template,
  );
  createFromTemplate(
    "App.tsx",
    join(experimentDir, "src", "App.tsx"),
    template,
  );
  createFromTemplate(
    "index.css",
    join(experimentDir, "src", "index.css"),
    template,
  );
  createFromTemplate("README.md", join(experimentDir, "README.md"), template);

  // App.tsx uses dynamic discovery, no manual update needed

  console.log(`✅ Created ${experimentName}: ${name}`);
  console.log(`🌐 URL: http://localhost:5173/${experimentName}/`);
}

function copyExperiment(sourceExperimentName: string): void {
  const sourceDir = join(".", sourceExperimentName);

  if (!existsSync(sourceDir)) {
    console.error(
      `Error: Source experiment ${sourceExperimentName} does not exist`,
    );
    process.exit(1);
  }

  if (!sourceExperimentName.startsWith("experiment-")) {
    console.error(
      `Error: Invalid experiment name format. Expected format: experiment-XX`,
    );
    process.exit(1);
  }

  const experimentNumber = getNextExperimentNumber();
  const newExperimentName = `experiment-${experimentNumber}`;
  const newExperimentDir = join(".", newExperimentName);

  if (existsSync(newExperimentDir)) {
    console.error(
      `Error: Target experiment directory ${newExperimentName} already exists`,
    );
    process.exit(1);
  }

  // Copy the entire experiment directory
  cpSync(sourceDir, newExperimentDir, { recursive: true });

  // Update the README.md to reflect the new experiment number
  const readmePath = join(newExperimentDir, "README.md");
  if (existsSync(readmePath)) {
    let readmeContent = readFileSync(readmePath, "utf-8");
    readmeContent = readmeContent.replace(
      new RegExp(sourceExperimentName, "g"),
      newExperimentName,
    );
    writeFileSync(readmePath, readmeContent);
  }

  console.log(`📋 Copied ${sourceExperimentName} to ${newExperimentName}`);
  console.log(`🌐 URL: http://localhost:5173/${newExperimentName}/`);
}

function deleteExperiment(experimentName: string): void {
  const experimentDir = join(".", experimentName);

  if (!existsSync(experimentDir)) {
    console.error(`Error: Experiment ${experimentName} does not exist`);
    process.exit(1);
  }

  if (!experimentName.startsWith("experiment-")) {
    console.error(
      `Error: Invalid experiment name format. Expected format: experiment-XX`,
    );
    process.exit(1);
  }

  // Remove experiment directory
  rmSync(experimentDir, { recursive: true, force: true });

  // App.tsx uses dynamic discovery, no manual update needed

  console.log(`🗑️  Deleted ${experimentName}`);
}

function createFromTemplate(
  templateName: string,
  outputPath: string,
  template: ExperimentTemplate,
): void {
  const templatePath = join("scripts", "templates", "experiment", templateName);

  if (!existsSync(templatePath)) {
    console.error(`Error: Template file ${templatePath} not found`);
    process.exit(1);
  }

  let content = readFileSync(templatePath, "utf-8");

  // Replace template placeholders
  content = content.replace(
    /\{\{EXPERIMENT_NAME\}\}/g,
    `experiment-${template.number}`,
  );
  content = content.replace(
    /\{\{EXPERIMENT_DESCRIPTION\}\}/g,
    template.description,
  );
  content = content.replace(/\{\{EXPERIMENT_NUMBER\}\}/g, template.number);

  writeFileSync(outputPath, content);
}

function showUsage(): void {
  console.log(`Usage: npx tsx scripts/workbench.ts <command> [arguments]

Commands:
  create <description>    Create a new experiment with auto-generated number
  copy <experiment>       Copy an existing experiment with auto-generated number
  delete <experiment>     Delete an existing experiment

Examples:
  npx tsx scripts/workbench.ts create "MessageChannel Communication"
  npx tsx scripts/workbench.ts copy experiment-01
  npx tsx scripts/workbench.ts delete experiment-01`);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showUsage();
    process.exit(1);
  }

  const command = args[0];

  switch (command) {
    case "create":
      if (args.length < 2) {
        console.error("Error: create command requires a description");
        showUsage();
        process.exit(1);
      }
      createExperiment(args.slice(1).join(" "));
      break;

    case "copy":
      if (args.length < 2) {
        console.error("Error: copy command requires an experiment name");
        showUsage();
        process.exit(1);
      }
      copyExperiment(args[1]);
      break;

    case "delete":
      if (args.length < 2) {
        console.error("Error: delete command requires an experiment name");
        showUsage();
        process.exit(1);
      }
      deleteExperiment(args[1]);
      break;

    default:
      console.error(`Error: Unknown command '${command}'`);
      showUsage();
      process.exit(1);
  }
}

main();
