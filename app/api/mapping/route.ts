import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/app/config/firebaseconfig';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityCode = searchParams.get('cityCode');

    if (!cityCode) {
      return NextResponse.json(
        { error: 'Missing required parameter: cityCode' },
        { status: 400 }
      );
    }

    const agentesQ = query(
      collection(db, 'agentes'),
      where('cityId', '==', cityCode)
    );
    const coletivosQ = query(
      collection(db, 'coletivoSemCNPJ'),
      where('cityId', '==', cityCode)
    );
    const espacosQ = query(
      collection(db, 'espacoCultural'),
      where('cityId', '==', cityCode)
    );
    const proponentesQ = query(
      collection(db, 'proponentes'),
      where('cityId', '==', cityCode)
    );

    const [agentesSnap, coletivosSnap, espacosSnap, proponentesSnap] = await Promise.all([
      getDocs(agentesQ),
      getDocs(coletivosQ),
      getDocs(espacosQ),
      getDocs(proponentesQ),
    ]);

    const agentes = agentesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const coletivos = coletivosSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const espacos = espacosSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const proponentes = proponentesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      cityCode,
      counts: {
        agentes: agentes.length,
        coletivos: coletivos.length,
        espacos: espacos.length,
        proponentes: proponentes.length,
        total: agentes.length + coletivos.length + espacos.length + proponentes.length,
      },
    });
  } catch (error) {
    console.error('Mapping API error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching mapping data' },
      { status: 500 }
    );
  }
}
