# Resumable execution and Workers

The production Worker in
`src/markdown/extensions/mathjslab/mathjslab.worker.ts` creates
`InProcessMathJSLabRuntime` and `RuntimeWorkerServer` from `mathjslab/runtime`.
The Markdown adapter uses `RemoteMathJSLabRuntime`; each document session has a
Dedicated Worker. The app supplies host integration rather than another
evaluator or numerical backend.

## Evaluation and output ownership

The kernel retains supported control flow, calls, argument values and native
destinations across host waits such as `pause` and `load`. The app preserves
the document's resource context and materializes plot descriptions on the main
thread. Plot preparation in the kernel has no DOM or Plotly dependency.

Common external functions and `plot2d` sampling use the interpreter of the
active operation, including in the synchronous prompt. Temporary scopes,
precision and plot capture are restored in `finally` after success or failure.
A suspended operation must not leave an interpreter or plot capture active.

Fences share their document's workspace and execute in order. Other documents
have independent workspaces. Returned array/cell elements and supported
returned receivers retain evaluation order; their exact language coverage is
defined by the kernel, not by the app's adapter.

## Host effects, cancellation and recovery

Script reads resolve against the document source URL and use its resource
service, policy and signal. Cancelled delays remove their timer and listener.
Cancellation, timeout and disposal abort pending effects and ignore late
responses. A host implementation that ignores its signal may continue its own
work, but cannot resume a terminated Worker.

A normal host failure is delivered to the suspended operation, allowing
supported `catch` and `unwind_protect_cleanup` paths to run. Earlier workspace
effects remain. Remote cancellation or timeout terminates the Worker; a later
operation recreates a clean workspace. Previous commands are not replayed.
There is no rollback or persistent continuation after termination. Disposing
one session does not dispose other documents.

The adapter retains final MathML, supported script messages and plots. It does
not promise an output for every internal instruction or partial output after an
error or cancellation. Numeric operations can remain indivisible; resumable
execution does not imply full MATLAB/Octave language coverage.

The package's advanced `WorkerMathJSLabTransport` protocol is distinct from the
kernel's canonical runtime protocol. Its tests cannot establish coverage of the
production app Worker. Native browser imports may require an import map for
`mathjslab/core`; bundlers resolve the package subpath.

## Reproducible verification

Run against the installed dependencies and their built artifacts:

```sh
npm test
npm run test:browser
```

The resumable and returned-receiver browser suites check effect order, no
replayed arguments, loops, multiple outputs, literal/receiver retention,
numeric settings, host failures, pending reads, cancellation and recovery. The
injected Worker fixture adds a test-only observer of active contexts.

`markdown-mathjslab-worker.spec.ts` covers document integration, relative
loads, resource policy and timeouts. `mathjslab-runtime-distribution.spec.ts`
exercises the kernel's public browser factory independently of the app adapter.
`MathJSLabExternalFunctions.spec.ts` checks synchronous external functions;
`mathjslab-sync-prompt.spec.ts` checks the real application prompt and Plotly
after a failure. Descriptor-only renderer fixtures do not establish visual
Plotly correctness.

For the supported resumable subset and remaining boundaries, consult the
[kernel execution contract](https://github.com/MathJSLab/mathjslab/blob/main/doc/resumable-execution.md).
Package publication and release preparation require their own checks; these
application tests do not publish either dependency.
