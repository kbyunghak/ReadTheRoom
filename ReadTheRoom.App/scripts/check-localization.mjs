import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const PROJECT_ROOT = process.cwd();
const LOCALE_FILES = {
  en: path.join(PROJECT_ROOT, 'locales', 'en.ts'),
  ko: path.join(PROJECT_ROOT, 'locales', 'ko.ts'),
};

const PLACEHOLDER_PATTERN = /\{[a-zA-Z0-9_]+\}/g;

const readSourceFile = (filePath) =>
  ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

const getPropertyName = (name) => {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }

  return name.getText();
};

const extractStringValue = (node) => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  return null;
};

const extractPlaceholders = (text) =>
  Array.from(new Set(text.match(PLACEHOLDER_PATTERN) ?? [])).sort();

const isEmptyString = (node) => {
  const value = extractStringValue(node);
  return value !== null && value.trim().length === 0;
};

const describeNode = (node) => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return {
      kind: 'string',
      placeholders: extractPlaceholders(node.text),
      isEmpty: node.text.trim().length === 0,
    };
  }

  if (node.kind === ts.SyntaxKind.NullKeyword) {
    return { kind: 'null' };
  }

  if (ts.isArrayLiteralExpression(node)) {
    return {
      kind: 'array',
      children: node.elements.map((element, index) => [`[${index}]`, describeNode(element)]),
    };
  }

  if (ts.isObjectLiteralExpression(node)) {
    return describeObject(node);
  }

  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    const parameters = node.parameters.map((parameter) => parameter.name.getText());
    const bodyText = node.body.getText();

    return {
      kind: 'function',
      parameters,
      placeholders: extractPlaceholders(bodyText),
      missingParameterRefs: parameters.filter((parameter) => !bodyText.includes(parameter)),
    };
  }

  return {
    kind: 'dynamic',
    expression: node.getText().replace(/\s+/g, ' ').slice(0, 120),
  };
};

const describeObject = (node) => {
  const children = [];

  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }

    children.push([getPropertyName(property.name), describeNode(property.initializer)]);
  }

  return { kind: 'object', children };
};

const findLocaleObject = (sourceFile, exportName) => {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === exportName &&
        declaration.initializer
      ) {
        const initializer = ts.isAsExpression(declaration.initializer)
          ? declaration.initializer.expression
          : declaration.initializer;

        if (!ts.isObjectLiteralExpression(initializer)) {
          throw new Error(`${exportName} is not an object literal.`);
        }

        return describeObject(initializer);
      }
    }
  }

  throw new Error(`Could not find exported locale object "${exportName}".`);
};

const formatPath = (segments) => segments.join('.');

const compareArrays = (left, right) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const compareNodes = (base, target, segments, failures) => {
  const currentPath = formatPath(segments);

  if (base.kind !== target.kind) {
    failures.push(`${currentPath}: expected ${base.kind}, found ${target.kind}`);
    return;
  }

  if (target.kind === 'string') {
    if (target.isEmpty) {
      failures.push(`${currentPath}: ko translation is empty`);
    }

    if (!compareArrays(base.placeholders, target.placeholders)) {
      failures.push(
        `${currentPath}: placeholder mismatch en=[${base.placeholders.join(', ')}] ko=[${target.placeholders.join(', ')}]`,
      );
    }
    return;
  }

  if (target.kind === 'function') {
    if (!compareArrays(base.parameters, target.parameters)) {
      failures.push(
        `${currentPath}: function parameter mismatch en=[${base.parameters.join(', ')}] ko=[${target.parameters.join(', ')}]`,
      );
    }

    if (!compareArrays(base.placeholders, target.placeholders)) {
      failures.push(
        `${currentPath}: function placeholder mismatch en=[${base.placeholders.join(', ')}] ko=[${target.placeholders.join(', ')}]`,
      );
    }

    if (target.missingParameterRefs.length > 0) {
      failures.push(
        `${currentPath}: ko function does not reference parameter(s) ${target.missingParameterRefs.join(', ')}`,
      );
    }
    return;
  }

  if (target.kind === 'array') {
    if (base.children.length !== target.children.length) {
      failures.push(
        `${currentPath}: array length mismatch en=${base.children.length} ko=${target.children.length}`,
      );
      return;
    }

    base.children.forEach(([name, child], index) => {
      compareNodes(child, target.children[index][1], [...segments, name], failures);
    });
    return;
  }

  if (target.kind === 'object') {
    const baseMap = new Map(base.children);
    const targetMap = new Map(target.children);

    for (const key of baseMap.keys()) {
      if (!targetMap.has(key)) {
        failures.push(`${currentPath}: missing ko key "${key}"`);
      }
    }

    for (const key of targetMap.keys()) {
      if (!baseMap.has(key)) {
        failures.push(`${currentPath}: extra ko key "${key}"`);
      }
    }

    for (const [key, child] of baseMap) {
      if (targetMap.has(key)) {
        compareNodes(child, targetMap.get(key), [...segments, key], failures);
      }
    }
  }
};

const enLocale = findLocaleObject(readSourceFile(LOCALE_FILES.en), 'en');
const koLocale = findLocaleObject(readSourceFile(LOCALE_FILES.ko), 'ko');
const failures = [];

compareNodes(enLocale, koLocale, ['locales'], failures);

if (failures.length > 0) {
  console.error('Localization consistency check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Localization check passed.');
