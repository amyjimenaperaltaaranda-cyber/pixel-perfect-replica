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
- Album turns select sheet faces by cumulative strip angle and commit the settled spread with sheet removal atomically, preventing reverse-face culling and stale-content flashes.
- Album edge layers derive from original page objects and exclude flat/moving faces; bounded clips expose only protrusions, while grouped page lookups and strip intersection culling avoid multiplying hidden content during turns.
- Photo reverses render via PhotoBack (mirrored silhouette from the PNG's alpha mask, readable seeded doodles); never mirror the front image to fake a back.
- Drive photos are referenced by file id and streamed through /api/public/drive-image (images only); never store image data in state.
