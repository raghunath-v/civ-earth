/**
 * Centralized disputed-territory caveats. Keep tone neutral, cite recognized facts,
 * don't editorialize. These render as a banner near the top of each affected country's
 * stat card.
 */
export const DISPUTED_NOTES: Record<string, string> = {
  TWN: 'Sovereignty disputed by the People\'s Republic of China. Taiwan governs itself with full state functions but is formally recognized by only 12 UN members (2024). The UN treats Taiwan as part of the PRC. Data shown here describes the de-facto ROC-administered jurisdiction.',
  PSE: 'The State of Palestine is recognized by 146 of 193 UN members. Borders and full sovereignty are contested; the West Bank, Gaza, and East Jerusalem have differing de-facto governance. Figures aggregate across the territories where data exists.',
  KOS: 'Independence declared 2008; recognized by ~104 UN members. Not recognized by Serbia, Russia, China, or India. Kosovo is not a UN member.',
  ESH: 'Status disputed. The northern ~75% is administered by Morocco; the eastern "Free Zone" by the Sahrawi Arab Democratic Republic (Polisario Front), recognized by 47 UN members and the African Union.',
  CYP: 'The northern third of the island is the Turkish Republic of Northern Cyprus, recognized only by Turkey. Data here covers the internationally-recognized Republic of Cyprus.',
  UKR: 'Crimea, parts of Donetsk, Luhansk, Zaporizhzhia, and Kherson are under Russian occupation following the 2014 and 2022 invasions. Annexations are not recognized internationally.',
  MMR: 'Civilian shadow government (National Unity Government / NUG) competes with the military junta (State Administration Council / SAC) for legitimacy. Several ethnic armed organizations and the People\'s Defence Force control significant border regions.',
  ISR: 'Israel\'s borders are unsettled in international law. East Jerusalem (annexed) and the Golan Heights (annexed from Syria) are not internationally recognized as part of Israel; the West Bank is under partial military administration.',
  SOM: 'Somaliland in the northwest has functioned as a self-declared independent state since 1991 but is not recognized by any UN member. Puntland in the northeast operates with substantial autonomy.',
  CHN: 'The PRC claims Taiwan and administers Tibet and Xinjiang under contested human-rights conditions; Hong Kong and Macau have separate-system status under "One Country, Two Systems."',
  RUS: 'Russia administers Crimea and parts of four Ukrainian oblasts (Donetsk, Luhansk, Zaporizhzhia, Kherson) under occupation since 2014/2022. Annexations are not internationally recognized.',
};
