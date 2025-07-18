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

## To-Do List

- [ ] Webpack demo
- [ ] Testing
- [ ] CI/CD
- [ ] Deployment
