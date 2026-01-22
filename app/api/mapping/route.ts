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

    const proponentesQ = query(
      collection(db, 'proponentes'),
      where('cityId', '==', cityCode)
    );

    const [proponentesSnap, citiesSnap] = await Promise.all([
      getDocs(proponentesQ),
      getDocs(collection(db, 'cities')),
    ]);

    let cityName = 'Cidade desconhecida';
    let cityUF = '';

    citiesSnap.forEach((doc) => {
      const data = doc.data();
      if (data.cityId === cityCode || doc.id === cityCode) {
        cityName = data.name || 'Cidade desconhecida';
        cityUF = data.uf || '';
      }
    });

    const countsByTipo: Record<string, number> = {};
    let total = 0;

    proponentesSnap.docs.forEach((doc) => {
      const data = doc.data();
      const tipo = data.tipo || 'sem_tipo';
      countsByTipo[tipo] = (countsByTipo[tipo] || 0) + 1;
      total++;
    });

    return NextResponse.json({
      success: true,
      cityCode,
      cityName,
      cityUF,
      total,
      countsByTipo,
    });
  } catch (error) {
    console.error('Mapping API error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching mapping data' },
      { status: 500 }
    );
  }
}
