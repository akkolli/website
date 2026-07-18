---
title: 'Can an RTX 5090 Be an Always On Local Agent Box?'
date: '2026-05-26'
description: 'Qwen3.6-27B, MTP, clock limits, and trying to make a 5090 something I would leave running all day.'
tags: ['LLM Inference', 'GPU', 'Local Agents']
---

I wanted a local agent I could leave running all day.

Not a benchmark setup. Not a machine I turn on for one prompt, screenshot the result, then shut down. I wanted something that could sit there with a coding agent or research agent running for hours.

A lot of people use Macs for this. That makes sense.

The idle draw is very low. Energy Star lists the 2025 M3 Ultra Mac Studio at **7.7 W short idle** and **6.3 W long idle** for the 512 GB model. Apple lists the same class of machine at **9 W idle** and **270 W max** from the wall.

That is a good power envelope for local agents. Agents spend a lot of time waiting on tools, tests, file reads, and network calls. Peak speed matters, but so does idle power. So does the power draw during a long decode.

And **30 to 40 generated tokens per second** is fine for a lot of agent work. It may not feel great if you are staring at every token during interactive coding. But if the agent is reading files, running commands, and waiting on tests, the model is only one part of the loop.

My question was simple. I wanted to see whether my RTX 5090 could fit into that kind of all day setup.

Not at Mac idle power. That is not going to happen. But low enough that I would be comfortable leaving it on.

## Why decode is awkward

LLMs generate one token at a time.

The model reads the prompt, predicts a token, adds that token to the context, then runs again. Each new token depends on what came before it.

That is awkward for a large GPU. A 5090 has a lot of compute, but a single decode stream often cannot use all of it. The GPU keeps moving model weights and KV cache around to produce one new token. Then it repeats.

So raw GPU size does not always turn into efficient local inference.

{{< figure src="/images/2_qwen36_tokens_per_kwh/fig5_autoregressive_decode.svg" width="1200" height="520" alt="Autoregressive decoding diagram showing one model pass producing one accepted token at a time" />}}

Speculative decoding tries to fix this shape.

A cheap drafter guesses future tokens. The main model checks those guesses. Accepted tokens stay. Bad guesses get dropped.

The goal is simple. Get more than one useful token out of an expensive model pass.

## Why MTP helps

MTP means multi token prediction.

Instead of using a fully separate draft model, an MTP model has a lookahead path built in. It can draft future tokens, then the main model verifies them.

That is why the Qwen3.6 MTP model caught my attention. `Qwen3.6-27B` is a dense 27B model with a long context window. The model card recommends at least 128K context for complex thinking work. That is the kind of model I want for a local agent.

Large enough to be useful. Small enough to run locally.

{{< figure src="/images/2_qwen36_tokens_per_kwh/fig6_mtp_decode.svg" width="1200" height="560" alt="MTP speculative decoding diagram showing a lookahead head proposing several draft tokens and the target model verifying them" />}}

## The 5090 settings

I used the Qwen MTP GGUF setup. I also locked the clocks instead of letting the card boost freely.

```bash
sudo nvidia-smi -lgc 1200,1200
sudo nvidia-smi -lmc 7001,7001
```

This part matters. On my card, `nvidia-smi -pl` cannot go low enough.

```text
Default Power Limit: 575 W
Min Power Limit:     400 W
Max Power Limit:     600 W
```

The normal power limit knob can stop the card from going past 400 W. It cannot ask the card to behave like a 215 W inference card.

Clock limiting is what got me there.

The operating point I liked was this.

```text
Qwen3.6-27B MTP
87.2 generated tok/s
215 W GPU power
```

The same power settings without MTP gave me **32.1 tok/s**.

So MTP was not a small change. It moved the setup from usable to comfortable.

{{< figure src="/images/2_qwen36_tokens_per_kwh/author_nvidia_mtp_x6_215w_report.png" width="1656" height="807" alt="Author measurement screenshot showing Qwen3.6-27B MTP throughput and a 215 watt GPU power reading" />}}

## The math

The metric I care about is generated tokens per watt second.

A watt second is a joule. So I will write it as **tokens/J**.

```text
tokens/J = generated tok/s / watts
```

For the 215 W MTP run, the math is this.

```text
87.2 tok/s / 215 W = 0.4056 tokens/J
1 / 0.4056          = 2.47 J/token
```

For the no MTP run at the same power settings, it is this.

```text
32.1 tok/s / 215 W = 0.1493 tokens/J
1 / 0.1493         = 6.70 J/token
```

So MTP improved generated token efficiency by **2.72x** at the same 215 W operating point.

```text
0.4056 / 0.1493 = 2.72x
```

There is a second question. Did clock limiting itself improve efficiency compared with stock clocks?

I do not have a clean stock clock run with both throughput and power recorded. So I will not claim that yet.

But the cutoff is easy to calculate.

```text
To match 0.4056 tokens/J at 400 W, stock would need 162.2 tok/s.
To match 0.4056 tokens/J at 450 W, stock would need 182.5 tok/s.
```

My MTP x4 screenshot shows about **151.5 tok/s**, but I did not record watts for that run. If that run was near 400 W, the 215 W point is more efficient. If a stock or high power run gets past **162.2 tok/s at 400 W**, it matches the 215 W point. At **450 W**, it needs **182.5 tok/s**.

That is the measurement I still need.

## Daily power

At 87.2 tok/s, the machine can generate this much text in a day.

```text
87.2 tok/s * 86,400 sec/day = 7,534,080 tokens/day
```

The GPU only number is this.

```text
0.4056 tokens/J * 3,600,000 J/kWh = 1.46M tokens/kWh
215 W * 24 h / 1000 = 5.16 kWh/day
7,534,080 / 5.16    = 1.46M tokens/kWh
```

That is clean, but it is not whole machine power.

My CPU pulls about **60 W** by default. If I add that, I get a rough box number.

```text
215 W GPU + 60 W CPU = 275 W
275 W * 24 h / 1000 = 6.60 kWh/day
7,534,080 / 6.60    = 1.14M tokens/kWh
```

That gives two comparison points.

```text
GPU only:       87.2 tok/s / 215 W = 0.4056 tokens/J
GPU plus CPU:   87.2 tok/s / 275 W = 0.3171 tokens/J
```

Adding my current CPU baseline moves the run from **2.47 J/token** to **3.15 J/token**.

That is still fine for me. I would leave that running.

Could I push the GPU lower? Yes. I can get the 5090 closer to **150 W**. I need a proper sweep before I say where the best point is. For now, 215 W is the point I like. It is fast enough, and it does not feel wasteful.

{{< figure src="/images/2_qwen36_tokens_per_kwh/fig1_tokens_per_day.png" width="1800" height="990" alt="Bar chart comparing generated tokens per day across the measured NVIDIA run and M3 Ultra benchmark rows" />}}

## The Mac comparison

The public Apple rows I found are oMLX results for M3 Ultra. They include throughput. They do not include wall power during the run.

The strongest 80 core rows I found for `Qwen3.6-27B-oQ4-mtp` were these.

```text
8k context    42.0 generated tok/s
16k context   41.1 generated tok/s
32k context   38.6 generated tok/s
```

I also found a `Qwen3.6-27B-MXFP4-MTP` row at **25.7 tok/s** for 8k.

Those are good numbers for agent work. The missing number is power.

Against my GPU only 215 W point, the M3 Ultra 80 core oQ4 MTP rows need to run around **95 to 104 W at the wall** to match the 5090 on generated tokens per kWh.

{{< figure src="/images/2_qwen36_tokens_per_kwh/fig3_m3_break_even_power.png" width="1800" height="990" alt="Bar chart showing the M3 Ultra wall-power levels needed to match the measured NVIDIA GPU-side tokens per kWh" />}}

Against my rough 275 W whole box estimate, the break even numbers move up.

```text
M3 Ultra 80 core oQ4 MTP at 8k    42.0 tok/s / 0.3171 tokens/J = 132.5 W
M3 Ultra 80 core oQ4 MTP at 16k   41.1 tok/s / 0.3171 tokens/J = 129.6 W
M3 Ultra 80 core oQ4 MTP at 32k   38.6 tok/s / 0.3171 tokens/J = 121.7 W
M3 Ultra 80 core MXFP4 MTP at 8k  25.7 tok/s / 0.3171 tokens/J = 81.0 W
```

So there are two fair comparisons.

Against GPU only, the Mac needs about **95 to 104 W** for the oQ4 MTP rows.

Against my rough whole box number, it needs about **122 to 132 W**.

That is why I do not want to turn this into a clean win for either side. The Mac has very low idle power, a low peak envelope, and unified memory. The 5090 has much more decode headroom if I tune it.

The real comparison needs outlet power during the same workload.

{{< figure src="/images/2_qwen36_tokens_per_kwh/fig4_m3_power_sensitivity.png" width="1800" height="990" alt="Line chart showing M3 Ultra tokens per kWh across different assumed wall-power levels" />}}

## What changed for me

Before this, I thought of the 5090 as a burst machine.

Use it for a heavy run. Finish the job. Shut it down.

After this, I am more willing to treat it as a local agent box.

Not at stock settings. Not with the motherboard and GPU doing whatever they want. But with clock limits, MTP, and a power point I chose, the setup lands somewhere I can live with.

```text
87.2 generated tok/s
215 W GPU power
about 275 W with my current CPU baseline
7.53M generated tokens/day
```

That is enough throughput for an agent to read, edit, run tools, make mistakes, and keep going.

I do not need the maximum token rate. I need a machine that can keep working for hours without feeling wasteful.

## Next test

MTP is one way to deal with the one token at a time problem.

Next I want to test diffusion based speculative decoding.

DFlash is the paper I am looking at. It uses a lightweight block diffusion model as the drafter. The draft side can propose a block of tokens in parallel. The target model still verifies the draft.

The paper reports lossless acceleration. That is useful. But the question I care about is narrower.

```text
Does this improve tokens/J for a local agent that runs for hours?
```

That is the next article.

## Sources

Apple power numbers came from [Apple Support](https://support.apple.com/en-us/102027).

Energy Star idle numbers came from [Energy Star product 4513877](https://www.energystar.gov/productfinder/product/certified-computers/details/4513877/export/pdf).

The Qwen context note came from the [`Qwen3.6-27B` model card](https://huggingface.co/Qwen/Qwen3.6-27B).

The MTP explanation follows the [vLLM MTP docs](https://docs.vllm.ai/en/latest/features/speculative_decoding/mtp/) and the [vLLM speculative decoding docs](https://docs.vllm.ai/usage/speculative_decoding/).

The diffusion speculation follow up is based on [DFlash](https://arxiv.org/abs/2602.06036).

The Apple throughput comparison uses the oMLX [quantization table](https://omlx.ai/benchmarks?order=desc&page=7143&sort=quantization) and [memory table](https://omlx.ai/benchmarks?order=desc&sort=memory_gb).
