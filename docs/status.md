# Module Federation Implementation Status

| Tool        |   Created with `create module-federation@latest`    |                                 Imported from Existing Project                                 |
| ----------- | :-------------------------------------------------: | :--------------------------------------------------------------------------------------------: |
| **Rslib**   |               ✓ (React 18, `mf_lib`)                |                                                                                                |
| **Rsbuild** | ✓ (React 18, `mf_react_rsbuild`, `mf_provider_app`) |                                                                                                |
| **Vite**    |                         N/A                         |                ✓ (React 18, Vite 7, `mf_react_vite`, typing not supported yet )                |
| **Webpack** |                         N/A                         | ✓ (React 18, Webpack 5 , `mf_react_webpack`, need to use React.Lazy to load remote components) |

---

✓ = Implemented<br>
Empty = Not implemented

---

## Notes

React webpack MF implementation cannot import directly from index.tsx export ( `mf_lib` as `lib/components` ). Have to direct expose a component and consume in webpack sample as a direct React.Lazy import , checkout `mf_react_webpack/src/App.tsx` for details

---

## Solution

Current solution is implemented with pnpm workspace monorepo . The goal is to create a polyrepo solution that can be used with any framework.

---

## To-Do List

- ~~Webpack demo~~
- ~~Testing~~
- CI/CD
- Deployment
- Documentation
- Polyrepo solution that removes pnpm workspace
