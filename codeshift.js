export default function transformer(file, api) {
    const j = api.jscodeshift;
    
    const root = j(file.source);

    let needAddImport = false

    // 1. 找到文件中含有contextTypes的
    const Class = root.find(j.ClassDeclaration)
    if (Class.size() > 0) {
        // 找到是不是有intl 的 context
        const contextType = Class
            .find(j.ClassBody)
            .find(j.ClassProperty, { key: { name: 'contextTypes'} })
            // .find(j.ObjectExpression)
            // .find(j.Property)
        if (contextType && contextType.size() > 0) {
            needAddImport = true
        }
    }

    // 2. 给这些文件的PropTypes后面都添加一行import语句
    if (needAddImport) {
        console.log('needAddImport', needAddImport)
        addPropTypesImport(j, root);
    }

    
    
    return needAddImport ? root.toSource({quote: 'single', trailingComma: true}) : null
}


function addPropTypesImport(j, root) {
    const importStatement = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier('intl'))],
        j.literal('react-intl-universal')
      );
      const path = findImportAfterPropTypes(j, root);
      if (!path) return
    j(path).insertAfter(importStatement);
    return
}
function findImportAfterPropTypes(j, root) {
    let target, targetName;

    root
      .find(j.ImportDeclaration)
      .forEach(path => {
        const name = path.value.source.value.toLowerCase();
        if (name === 'prop-types') {
          targetName = name;
          target = path;
        }
      });

    return target;
  }