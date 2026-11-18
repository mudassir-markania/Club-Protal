'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  MapPin,
  Calendar,
  Mail,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
} from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-[#0B1528] text-slate-300 pt-14 pb-8 border-t border-slate-800/80 mt-16 antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Description (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg text-white">
                <Trophy className="w-5 h-5 fill-white text-white drop-shadow-xs" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-base tracking-tight text-white uppercase">
                  APEX<span className="text-[#38BDF8]">ARENA</span>
                </span>
                <span className="text-[11px] font-black tracking-widest text-[#FB923C] uppercase">
                  APL SEASON 9
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The official Sports Tournament Management Portal of Nexcore Institute of Technology,
              designed to operate and showcase APL Season 9.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-400">
                Live Tournament Engine Active
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
              <Link href="/leaderboard" className="hover:text-amber-400 transition-colors">
                Leaderboard
              </Link>
              <Link href="#about" className="hover:text-amber-400 transition-colors">
                About APL
              </Link>
              <Link href="/houses" className="hover:text-amber-400 transition-colors">
                Clubs
              </Link>
              <Link href="/sports" className="hover:text-amber-400 transition-colors">
                Sports
              </Link>
              <Link href="#gallery" className="hover:text-amber-400 transition-colors">
                Gallery
              </Link>
              <Link href="/schedule" className="hover:text-amber-400 transition-colors">
                Schedule
              </Link>
              <Link href="#contact" className="hover:text-amber-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Col 3: Get in Touch (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Get in Touch
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
                <span>Nexcore Institute of Technology</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Nov 25th – Nov 28th, 2026</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href="mailto:apl@nexcore.edu.in"
                  className="hover:text-white transition-colors underline-offset-2 hover:underline"
                >
                  apl@nexcore.edu.in
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Follow Us (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Follow Us
            </h4>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-[#E1306C] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-[#FF0000] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-[#0077B5] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 ApexArena – APL Season 9. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/rules" className="hover:text-slate-400 transition">
              Tournament By-Laws
            </Link>
            <span>•</span>
            <Link href="/points-rules" className="hover:text-slate-400 transition">
              Fair Division Protocol
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-amber-400 transition">
              Officials Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
