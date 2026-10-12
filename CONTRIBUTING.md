# Contributing

## Commit history

`master` is the artifact: its history is what `git bisect`, `git blame`, and
future maintainers read. A pull request's commit list is scratch space until
the PR is merged.

Before requesting review (and CI enforces the basics):

1. **One logical change per commit.** A fix and the golden-file/test updates
   that prove it belong in the *same* commit, so bisect can never land on a
   commit whose tests contradict its code.

2. **Fold repair commits into what they repair.** When CI forces another
   tweak to a commit you already pushed:

   ```bash
   git commit --fixup=<sha of the commit being repaired>
   # when the branch is ready for review:
   git rebase -i --autosquash origin/master
   ```

   `--fixup` requires no message; `--autosquash` folds it in automatically,
   keeping the original commit's message.

3. **No churn messages.** `WIP`, `lint`, `save actual output`,
   `update golden output`, `normalize output`, `retrigger CI`, or any
   duplicate of a subject already on the branch — CI rejects these. The
   debugging narrative is still valuable: put it in the PR conversation,
   which GitHub preserves for free.

4. **Amend freely on your own branch.** Until someone else pulls it,
   `git commit --amend` rewrites history with no cost.

## Pull requests

- Keep the PR body informative: if the branch is eventually squashed, the PR
  body and commit list are all that survives into `master`.
- Prefer merge commits (the repository default) so the reviewed commit
  structure is preserved. Squash-merge only for branches whose history has
  no salvageable logical structure.
