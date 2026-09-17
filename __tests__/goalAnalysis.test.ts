import {
  cleanAnalysis,
  completedToolsCount,
  isToolComplete,
  sameAnalysis,
} from '@/constants/goalAnalysis';

const fullWhys = ['а', 'б', 'в', 'г', 'д'];
const fullSmarter = {
  specific: 's',
  measurable: 'm',
  achievable: 'a',
  relevant: 'r',
  timeBound: 't',
  evaluated: 'e',
  rewarded: 'r2',
};

describe('isToolComplete', () => {
  it('без проработки ничего не пройдено', () => {
    expect(isToolComplete(undefined, 'whys')).toBe(false);
    expect(completedToolsCount(undefined)).toBe(0);
  });

  it('5 Почему пройдено, только когда заполнены все пять ответов', () => {
    expect(isToolComplete({ whys: ['а', 'б', 'в', 'г'] }, 'whys')).toBe(false);
    expect(isToolComplete({ whys: ['а', 'б', '  ', 'г', 'д'] }, 'whys')).toBe(false);
    expect(isToolComplete({ whys: fullWhys }, 'whys')).toBe(true);
  });

  it('считает пройденные методики', () => {
    expect(completedToolsCount({ whys: fullWhys, smarter: fullSmarter })).toBe(2);
    expect(completedToolsCount({ smarter: { ...fullSmarter, rewarded: '' } })).toBe(0);
  });
});

describe('cleanAnalysis', () => {
  it('убирает пустые ответы и пробелы по краям', () => {
    expect(cleanAnalysis({ whys: ['', ' '], smarter: { specific: ' x ', measurable: '' }, descartes: {} })).toEqual({
      whys: undefined,
      smarter: { specific: 'x' },
      descartes: undefined,
    });
  });

  it('не оставляет дыр в массиве ответов', () => {
    const whys: string[] = [];
    whys[2] = 'третий';
    const cleaned = cleanAnalysis({ whys });
    expect(cleaned.whys).toEqual(['', '', 'третий', '', '']);
    expect(JSON.parse(JSON.stringify(cleaned)).whys).not.toContain(null);
  });
});

describe('sameAnalysis', () => {
  it('не видит разницы в пробелах по краям', () => {
    expect(sameAnalysis({ smarter: { specific: 'x' } }, { smarter: { specific: ' x ' }, whys: [] })).toBe(true);
    expect(sameAnalysis(undefined, { whys: ['а'] })).toBe(false);
  });
});
