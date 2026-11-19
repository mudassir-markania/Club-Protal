import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { calculateMatchPoints } from '@/lib/sports-rules';
import { getSportRules } from '@/lib/sports-rules-server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const body = await req.json();

    const match = await db.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
      include: {
        sport: true,
        participants: {
          include: {
            club: true,
            cricketTeam: true,
            players: {
              include: {
                player: true,
                club: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const allPlayers = await db.player.findMany({
      include: { club: true },
    });

    // Rotation index for fair remainder distribution
    const rotationSetting = await db.tournamentSetting.findUnique({
      where: { key: 'REMAINDER_ROTATION_INDEX' },
    });
    const currentRotation = parseInt(rotationSetting?.value || '0', 10) || 0;

    // Load active sport scoring rules from DB (custom configurations)
    const sportName = match.sport?.name || body.sportName;
    const dbRules = await getSportRules(sportName);
    const customRuleMap = new Map<string, number>();
    dbRules.forEach((r) => customRuleMap.set(r.ruleCode, r.points));

    const calculation = await calculateMatchPoints(
      {
        sportName,
        stageType: body.stageType || match.stageType || 'NORMAL',
        eventCategory: body.eventCategory || match.matchCategory,
        winnerParticipantId: body.winnerParticipantId,
        loserParticipantId: body.loserParticipantId,
        isDraw: body.isDraw,
        firstPlaceParticipantId: body.firstPlaceParticipantId,
        secondPlaceParticipantId: body.secondPlaceParticipantId,
        thirdPlaceParticipantId: body.thirdPlaceParticipantId,
        isTournamentPlacement: body.isTournamentPlacement,
        totalTeamsParticipating: body.totalTeamsParticipating || match.participants?.length,
        bgmiMvpPlayerId: body.bgmiMvpPlayerId,
        topScorerPlayerId: body.topScorerPlayerId,
        bestBatsmanMenPlayerId: body.bestBatsmanMenPlayerId,
        bestBatsmanWomenPlayerId: body.bestBatsmanWomenPlayerId,
        bestBowlerMenPlayerId: body.bestBowlerMenPlayerId,
        bestBowlerWomenPlayerId: body.bestBowlerWomenPlayerId,
        bestFielderMenPlayerId: body.bestFielderMenPlayerId,
        bestFielderWomenPlayerId: body.bestFielderWomenPlayerId,
        mostFoursPlayerId: body.mostFoursPlayerId,
        mostSixesPlayerId: body.mostSixesPlayerId,
        manOfTheTournamentMenPlayerId: body.manOfTheTournamentMenPlayerId,
        manOfTheTournamentWomenPlayerId: body.manOfTheTournamentWomenPlayerId,
        scoresSummary: body.scoresSummary || '',
      },
      match.participants,
      allPlayers,
      currentRotation,
      customRuleMap
    );

    return NextResponse.json({
      success: true,
      calculation,
    });
  } catch (error: any) {
    console.error('Points calculation preview error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

