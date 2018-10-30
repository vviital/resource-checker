const gulp = require('gulp');
const ts = require('gulp-typescript');
const path = require('path');
const argv = require('yargs').argv;
const fs = require('fs');
const Promise = require('bluebird');
const { exec } = require('child_process');

const checkPath = (pathToDirectory) => {
  if (!pathToDirectory) {
    throw new Error('Please provide --path parameter');
  }
  
  const fullPathToDirectory = path.join(__dirname, pathToDirectory);
  
  if (!fs.existsSync(fullPathToDirectory) || !fs.statSync(fullPathToDirectory).isDirectory()) {
    throw new Error('Please provide correct --path parameter (should point to project');
  }
};

gulp.task('build', () => {
  const { path: pathToProject } = argv;

  checkPath(pathToProject);

  const project = ts.createProject(path.join(__dirname, pathToProject, 'tsconfig.json'));
  const dest = path.join(__dirname, pathToProject, 'dest');

  return project
    .src()
    .pipe(project())
    .js
    .pipe(gulp.dest(dest))
});

gulp.task('watch', ['build'], () => {
  const { path: pathToProject } = argv;

  checkPath(pathToProject);

  gulp.watch(`${pathToProject}/**/*.ts`, ['build']);
});

gulp.task('build-all', () => {
  const directories = fs.readdirSync('packages');

  return Promise.all(directories
    .filter(dir => fs.statSync(path.join(__dirname, 'packages', dir)).isDirectory())
    .map(dir => path.join('packages', dir))
    .map(dir => Promise.promisify(exec)(`yarn build --path=${dir}`).then(() => console.log('builded:', dir))));
});
