---
title: 'The RTX 5090 Is Blackwell, But Not That Blackwell'
date: '2026-02-27'
description: 'Why GeForce and datacenter Blackwell GPUs can share a name but expose different tensor-core programming paths.'
tags: ['Nvidia', 'GPU']
---

I bought an RTX 5090 FE mostly for machine learning work. I still play games on it, but the real reason I wanted the card was FP4 support on Blackwell Tensor Cores.

FP4 matters because deep learning is mostly a story about moving numbers through matrix multiplications. If you can use fewer bits per number without breaking the model, you can often run faster and fit more work into the same memory. For someone interested in low-precision compute, a consumer card with Blackwell Tensor Cores sounded like a very good deal.

Then I saw people in the GPU Mode Discord calling GeForce Blackwell "fake Blackwell."

That sounded ridiculous at first. The RTX 5090 is a Blackwell GPU. It runs Blackwell-era FP4 kernels. It is also very fast. But after digging through Nvidia's docs and running a few benchmarks, I understand what people were reacting to.

The short version: the 5090 is real Blackwell, but it is not a small B200.

## The takeaway

If you only remember one thing, remember this:

- GeForce Blackwell and datacenter Blackwell share a product-generation name.
- They do not expose the same low-level tensor-core programming model.
- The RTX 5090 can run very fast FP4 workloads.
- It does not expose datacenter Blackwell's `tcgen05` path or tensor memory.
- Compute capability is not a simple "higher number means all the features" ranking.

That last point is what fooled me.

The GeForce cards are `sm_120`, with compute capability 12. Datacenter Blackwell cards such as B200 are `sm_100`, with compute capability 10. A normal person would look at 12 versus 10 and assume the consumer card is newer, broader, or at least a superset.

That is not how this works.

Compute capability is a target for CUDA code generation. It tells the compiler what family of instructions and hardware behavior to expect. It is not a feature score. Starting with Blackwell, Nvidia is also leaning harder on family-specific feature sets, which means some low-level features exist for one Blackwell family and not another. Nvidia explains this in its writeup on [family-specific architecture features](https://developer.nvidia.com/blog/nvidia-blackwell-and-nvidia-cuda-12-9-introduce-family-specific-architecture-features/).

## A quick vocabulary reset

Here is the minimum context for the rest of the post.

- **Tensor Cores** are specialized GPU units built for the matrix multiplications that dominate deep learning.
- **Precision** means how many bits you use to store each number. FP32 uses 32 bits. FP16 uses 16. FP4 uses 4.
- **FP4** is interesting because it can reduce memory traffic and increase throughput, if the model can tolerate the lower precision.
- **NVFP4** is Nvidia's FP4 format for deep learning workloads.
- **A kernel** is a small program that runs on the GPU.
- **CUTLASS** is Nvidia's library for writing fast matrix multiplication kernels.
- **PTX** is Nvidia's low-level instruction language for CUDA GPUs.
- **An SM**, or streaming multiprocessor, is one of the GPU's main compute blocks.
- **Shared memory** is fast memory inside an SM.
- **TMEM**, or tensor memory, is extra memory near the Tensor Cores on datacenter Blackwell.

With that out of the way, the argument becomes much easier to follow.

## What datacenter Blackwell gets

Datacenter Blackwell introduces a new Tensor Core instruction family called `tcgen05`. Nvidia's CUTLASS documentation describes Blackwell SM100 GEMMs as targeting `tcgen05.mma` instructions, including support for 4-bit, 6-bit, and 8-bit floating point data types.

Those instructions are important because they are not just a new spelling for old matrix multiply code. They are part of a different programming path for Tensor Cores.

The big extra piece is TMEM. You can think of shared memory as the fast staging area CUDA programmers already use to feed GPU work efficiently. TMEM adds another staging area closer to the Tensor Cores. For the kind of low-precision matrix multiplication deep learning cares about, that matters because the math units can be so fast that feeding them becomes the problem.

This is where the GeForce and datacenter stories split.

The RTX 5090 has Blackwell Tensor Cores and can run NVFP4 workloads. But when I looked through the [CUDA PTX documentation](https://docs.nvidia.com/CUDA/parallel-thread-execution/), the `tcgen05` features I cared about were tied to the datacenter Blackwell family, not GeForce Blackwell. The Blackwell tuning guide also lists B200 shared-memory configurations up to 228 KB per SM; GeForce does not get the same TMEM story.

So the practical distinction is not "does this GPU support FP4 at all?" It does. The distinction is "does this GPU expose the datacenter Blackwell Tensor Core programming model?" It does not.

## What the 5090 actually does

I still wanted to measure the card instead of just reading target tables. So I pulled CUTLASS and ran its NVFP4 matrix multiplication example on the RTX 5090.

{{< figure src="/images/1_blackwell_dc_vs_gf/5090_65536_cropped.png" width="236" height="77" alt="A screenshot of a CUTLASS NVFP4 matrix multiplication benchmark on an RTX 5090" />}}

That is over a petaflop of NVFP4 compute.

A petaflop means one quadrillion floating-point operations per second. For a desktop GPU, that is not a fake result in any meaningful everyday sense. The card is doing serious low-precision work.

But the next question is whether the Tensor Cores are being fed efficiently. Nsight Compute gives the more interesting picture.

{{< figure src="/images/1_blackwell_dc_vs_gf/geforce_ncu.png" width="1974" height="807" alt="Nsight Compute showing register pressure and memory bottlenecks on a GeForce GPU" />}}

The short read is: memory is the bottleneck. The Tensor Cores can chew through math faster than the rest of the kernel can keep them supplied. Shared memory pressure shows up immediately.

That is exactly the problem the datacenter path is designed to address.

## What happens on B200

To compare against datacenter Blackwell, I rented a B200 instance on Vast.ai and ran the same kind of matrix multiplication with CUTLASS kernels targeting `sm_100a`.

{{< figure src="/images/1_blackwell_dc_vs_gf/nvtop_b200.png" width="647" height="106" alt="nvtop showing B200 GPU memory capacity" />}}

{{< figure src="/images/1_blackwell_dc_vs_gf/b200_65536_cropped.png" width="300" height="108" alt="A CUTLASS benchmark result from a B200 GPU" />}}

That run gets past 2 petaflops, and I suspect better kernels can push it further. The point is not just the number. The point is that the B200 has access to the datacenter Blackwell path that the 5090 does not.

This is the part that makes the "fake Blackwell" complaint emotionally understandable, even if I would not phrase it that way.

The RTX 5090 is not fake. It is a powerful GeForce card with real NVFP4 capability. But if you heard "Blackwell" and expected the Tensor Core programming model described in SM100 docs, you bought the wrong mental model.

## Why this should be clearer

I do not think the problem is that the 5090 is bad. I like the card.

The problem is that Nvidia's naming makes it easy to assume one Blackwell label means one Blackwell feature set. It does not. The details are discoverable, but they are scattered across CUDA docs, CUTLASS docs, tuning guides, target suffixes, and benchmark behavior.

That is fine for compiler engineers. It is not fine for people buying expensive hardware for machine learning.

If a GPU is marketed into a world where students, researchers, indie labs, and small companies are all trying to run deep learning workloads locally, the feature split should be much easier to understand before purchase.

## Bottom line

The RTX 5090 gives you a lot of low-precision compute for a desktop machine. It can run NVFP4 kernels, and in my tests it crossed a petaflop.

But GeForce Blackwell is not datacenter Blackwell. The missing `tcgen05` and TMEM path is the real split.

So yes, the 5090 is Blackwell.

It is just not that Blackwell.

Why Jensen, why.
