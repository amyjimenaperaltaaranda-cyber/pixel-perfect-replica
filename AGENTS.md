<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Desk objects share one WorkspaceObject shape (src/lib/desk/types.ts); visuals resolve via assetRegistry (src/lib/desk/assets.tsx) so assets can be swapped without touching behaviour.
- Desk state persists to localStorage via zustand persist; move to Lovable Cloud when Google Drive/accounts arrive.
