const menus = {
  main: `
    jenkins [command] <options>
    run ................ runs jenkins jobs
    --version, -v ...... show package version
    --help, -h ......... show help menu for a command`,

  run: `
    jenkins run <options>`,
};

export function help(args) {
  const subCmd = args._[0] === 'help' ? args._[1] : args._[0];

  console.log(menus[subCmd] || menus.main);
}
